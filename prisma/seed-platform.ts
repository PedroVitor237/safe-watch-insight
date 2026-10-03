import "dotenv/config";
import { prisma } from "../src/server/prisma/client";
import { officialChecklistService } from "../src/server/services/official-checklist.service";

async function main(): Promise<void> {
  const templates = await officialChecklistService.bootstrap();
  console.info(
    "Platform checklist templates:",
    templates.map((template) => ({
      id: template.id,
      title: template.title,
      versions: template.versions.map((version) => ({
        version: version.versionNumber,
        status: version.status,
        items: version.items.length,
      })),
    })),
  );
}
main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
