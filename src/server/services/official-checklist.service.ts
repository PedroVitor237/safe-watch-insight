import { Prisma, StandardType } from "@/generated/prisma/client";
import {
  OFFICIAL_CHECKLISTS,
  PLATFORM_STANDARD_BASELINE,
  STANDARD_CATALOGUE_URL,
} from "@/server/catalog/official-checklists";
import { ConflictError } from "@/server/errors";
import {
  OfficialChecklistRepository,
  type OfficialChecklistRecord,
} from "@/server/repositories/official-checklist.repository";
import type { VersionStandardPersistenceInput } from "@/server/repositories/checklist-version.repository";
import {
  CHECKLIST_CONTENT_SCHEMA_VERSION,
  createChecklistContentHash,
} from "@/server/utils/checklist-content-hash";
import { prepareChecklistPublication } from "./checklist-version.service";

export class OfficialChecklistService {
  constructor(private readonly repository = new OfficialChecklistRepository()) {}

  async bootstrap(): Promise<OfficialChecklistRecord[]> {
    const standards = new Map<string, VersionStandardPersistenceInput>();
    for (const baseline of PLATFORM_STANDARD_BASELINE) {
      const standard = await this.repository.ensureStandard({
        ...baseline,
        type: StandardType.NR,
        officialUrl: STANDARD_CATALOGUE_URL,
        summary: `Norma Regulamentadora ${baseline.code.slice(3)}.`,
      });
      if (standard.type !== StandardType.NR || !standard.isActive) {
        throw new ConflictError(`Required active NR unavailable: ${baseline.code}`);
      }
      standards.set(standard.code, {
        standardId: standard.id,
        type: standard.type,
        code: standard.code,
        title: standard.title,
        summary: standard.summary,
        officialUrl: standard.officialUrl,
      });
    }
    const templates: OfficialChecklistRecord[] = [];
    for (const definition of OFFICIAL_CHECKLISTS) {
      let existing = await this.repository.findById(definition.id);
      if (!existing) {
        const items = definition.items.map((item, index) => ({
          description: item.description,
          orderIndex: index + 1,
          isRequired: true,
          standards: item.standardCodes.map((code) => {
            const standard = standards.get(code);
            if (!standard) throw new ConflictError(`Unknown catalogue code: ${code}`);
            return standard;
          }),
        }));
        try {
          existing = await this.repository.createPublished({
            ...definition,
            items,
            publication: prepareChecklistPublication({ ...definition, items }, null),
          });
        } catch (error) {
          // A concurrent bootstrap may have created the same deterministic identity.
          if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002")
            throw error;
          existing = await this.repository.findById(definition.id);
          if (!existing) throw error;
        }
      }
      this.ensurePlatformContent(existing);
      templates.push(existing);
    }
    return templates;
  }

  private ensurePlatformContent(template: OfficialChecklistRecord): void {
    if (
      !template.isOfficial ||
      template.createdById !== null ||
      !template.isTemplate ||
      template.deletedAt ||
      !template.isActive
    ) {
      throw new ConflictError(
        `Platform template identity collision or unavailable: ${template.id}`,
      );
    }
    const published = template.versions.filter((version) => version.status === "PUBLISHED");
    if (
      !published.length ||
      published.some(
        (version) =>
          version.createdById !== null ||
          version.publishedById !== null ||
          !version.publishedAt ||
          version.contentSchemaVersion !== CHECKLIST_CONTENT_SCHEMA_VERSION ||
          version.contentHash !== createChecklistContentHash(version),
      )
    ) {
      throw new ConflictError(`Platform template publication integrity failed: ${template.id}`);
    }
    // Existing publications remain unchanged, including after catalogue metadata evolves.
  }
}

export const officialChecklistService = new OfficialChecklistService();
