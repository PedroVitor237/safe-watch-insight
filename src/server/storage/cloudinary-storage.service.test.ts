import assert from "node:assert/strict";
import test from "node:test";

import { CloudinaryStorageService } from "./cloudinary-storage.service.server";

const config = {
  cloudName: "safe-watch-test",
  apiKey: "public-key",
  apiSecret: "server-secret",
  folder: "safe-watch-insight/evidence",
};

test("uses a signed server-side multipart request and maps Cloudinary metadata", async () => {
  const capturedRequest: { url: string; body: FormData | null } = {
    url: "",
    body: null,
  };
  const fakeFetch = (async (input: string | URL | Request, init?: RequestInit) => {
    capturedRequest.url = String(input);
    capturedRequest.body = init?.body instanceof FormData ? init.body : null;

    return new Response(
      JSON.stringify({
        public_id: "safe-watch-insight/evidence/evidence-id",
        secure_url: "https://res.cloudinary.com/demo/image/upload/evidence.png",
        bytes: 8,
        width: 640,
        height: 480,
        resource_type: "image",
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;
  const storage = new CloudinaryStorageService(() => config, fakeFetch);
  const metadata = await storage.upload({
    key: "evidence-id",
    bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    fileName: "evidence.png",
    mimeType: "image/png",
  });

  assert.match(capturedRequest.url, /safe-watch-test\/image\/upload$/);
  assert.ok(capturedRequest.body);
  assert.equal(capturedRequest.body.get("api_key"), "public-key");
  assert.equal(capturedRequest.body.get("public_id"), "safe-watch-insight/evidence/evidence-id");
  assert.equal(typeof capturedRequest.body.get("signature"), "string");
  assert.equal(Array.from(capturedRequest.body.values()).includes(config.apiSecret), false);
  assert.equal(metadata.fileSize, 8);
  assert.equal(metadata.width, 640);
  assert.equal(metadata.height, 480);
});

test("accepts an idempotent Cloudinary not-found result during removal", async () => {
  const fakeFetch = (async () =>
    new Response(JSON.stringify({ result: "not found" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })) as typeof fetch;
  const storage = new CloudinaryStorageService(() => config, fakeFetch);

  await assert.doesNotReject(() => storage.remove("safe-watch-insight/evidence/missing"));
});
