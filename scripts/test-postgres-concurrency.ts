import { spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import pg from "pg";

// Never load .env or accept an existing database. Every invocation owns its cluster.
const directory = await mkdtemp(join(tmpdir(), "swi-concurrency-"));
const token = randomUUID();
const container = `swi-concurrency-${token}`;
const binaryDirectory = process.env.CONCURRENCY_POSTGRES_BIN;
const environment: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: "test" };
delete environment.DATABASE_URL;
delete environment.DIRECT_URL;
const children = new Set<ChildProcess>();
let localStarted = false;
let dockerStarted = false;
let pool: pg.Pool | undefined;

async function run(command: string, args: string[], live = false): Promise<string> {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { env: environment, stdio: ["ignore", "pipe", "pipe"] });
    children.add(child);
    let output = "";
    for (const stream of [child.stdout, child.stderr]) {
      stream?.on("data", (chunk: Buffer) => {
        output += chunk.toString();
        if (live) process.stdout.write(redact(chunk.toString()));
      });
    }
    child.once("error", () => reject(new Error(`Cannot execute ${command}.`)));
    child.once("exit", (code) => {
      children.delete(child);
      if (code === 0) resolveRun(output);
      else reject(new Error(`${command} failed (${code}). ${redact(output).slice(-3000)}`));
    });
  });
}

function redact(output: string): string {
  return output.replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[database URL redacted]");
}

async function freePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No local port available.");
  await new Promise<void>((done) => server.close(() => done()));
  return address.port;
}

async function eventually(check: () => Promise<boolean>, description: string): Promise<void> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (await check()) return;
    await delay(25);
  }
  throw new Error(`Timed out waiting for ${description}.`);
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    for (const child of children) child.kill("SIGTERM");
  });
}

try {
  let port: number;
  if (binaryDirectory) {
    port = await freePort();
    await run(join(binaryDirectory, "initdb"), [
      "-D",
      join(directory, "data"),
      "--auth=trust",
      "--username=concurrency_test",
      "--encoding=UTF8",
      "--locale=C",
    ]);
    await run(join(binaryDirectory, "pg_ctl"), [
      "-D",
      join(directory, "data"),
      "-l",
      join(directory, "postgres.log"),
      "-o",
      `-h 127.0.0.1 -p ${port} -k ${directory}`,
      "-w",
      "start",
    ]);
    localStarted = true;
  } else {
    // No bind mounts, persistent volumes, seed, or published non-loopback port.
    await run("docker", [
      "run",
      "--detach",
      "--rm",
      "--name",
      container,
      "--env",
      "POSTGRES_HOST_AUTH_METHOD=trust",
      "--env",
      "POSTGRES_USER=concurrency_test",
      "--tmpfs",
      "/var/lib/postgresql",
      "--publish",
      "127.0.0.1::5432",
      "postgres:18.4",
    ]);
    dockerStarted = true;
    const mapping = await run("docker", ["port", container, "5432/tcp"]);
    port = Number(mapping.trim().split(":").at(-1));
  }
  pool = new pg.Pool({ host: "127.0.0.1", port, user: "concurrency_test", database: "postgres" });
  await eventually(async () => {
    try {
      await pool!.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  }, "the disposable PostgreSQL server");
  const version = await pool.query<{ version: string; major: string }>(
    "SELECT version() AS version, current_setting('server_version_num') AS major",
  );
  const major = Number(version.rows[0].major);
  if (major < 180000 || major >= 190000) throw new Error("This suite requires PostgreSQL 18.");
  console.log(version.rows[0].version);
  await pool.query('CREATE DATABASE "swi_concurrency_test"');
  const database = new URL(`postgresql://127.0.0.1:${port}/swi_concurrency_test`);
  database.username = "concurrency_test";
  database.searchParams.set("application_name", "ic_p6_03_application");
  Object.assign(environment, {
    DATABASE_URL: database.toString(),
    CONCURRENCY_TEST_TOKEN: token,
    SESSION_SECRET: randomUUID() + randomUUID(),
  });
  // CLI output is captured so Prisma never prints a connection URL to the terminal.
  await run(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"]);
  console.log("Existing migrations applied to a new empty database; no seeds executed.");
  const testPool = new pg.Pool({ connectionString: database.toString() });
  try {
    await testPool.query("CREATE SCHEMA concurrency_harness");
    await testPool.query("CREATE TABLE concurrency_harness.authorization (token uuid PRIMARY KEY)");
    await testPool.query("INSERT INTO concurrency_harness.authorization VALUES ($1)", [token]);
  } finally {
    await testPool.end();
  }
  let failed = false;
  try {
    await run(
      process.execPath,
      ["--import", "tsx", "--test", "tests/integration/inspection-concurrency.test.ts"],
      true,
    );
  } catch {
    failed = true;
  }
  const webPort = await freePort();
  environment.CONCURRENCY_WEB_PORT = String(webPort);
  try {
    await run(
      process.execPath,
      [
        "node_modules/@playwright/test/cli.js",
        "test",
        "--config",
        "tests/integration/playwright.config.ts",
      ],
      true,
    );
  } catch {
    failed = true;
  }
  if (failed) throw new Error("Concurrency tests failed; see the test outcomes above.");
} catch (error) {
  console.error(redact(error instanceof Error ? error.message : "Concurrency validation failed."));
  process.exitCode = 1;
} finally {
  await pool?.end();
  for (const child of children) child.kill("SIGTERM");
  if (localStarted && binaryDirectory) {
    await run(join(binaryDirectory, "pg_ctl"), [
      "-D",
      join(directory, "data"),
      "-m",
      "immediate",
      "-w",
      "stop",
    ]);
  }
  if (dockerStarted) await run("docker", ["stop", container]);
  await rm(directory, { recursive: true, force: true });
  console.log("Disposable cluster removed.");
}
