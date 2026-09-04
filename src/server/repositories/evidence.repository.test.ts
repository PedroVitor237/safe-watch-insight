import "dotenv/config";

import assert from "node:assert/strict";
import test from "node:test";

import { buildActiveEvidenceOwnershipWhere } from "./evidence.repository";
import { buildActiveOwnedNonConformityWhere } from "./non-conformity.repository";

const USER_ID = "11111111-1111-4111-8111-111111111111";

test("evidence ownership predicate follows both historical inspection paths", () => {
  assert.deepEqual(buildActiveEvidenceOwnershipWhere(USER_ID), {
    OR: [
      {
        inspection: {
          userId: USER_ID,
          deletedAt: null,
        },
      },
      {
        nonConformity: {
          deletedAt: null,
          inspectionResponse: {
            inspection: {
              userId: USER_ID,
              deletedAt: null,
            },
          },
        },
      },
    ],
  });
});

test("non-conformity detail and list predicates require an owned active inspection", () => {
  assert.deepEqual(buildActiveOwnedNonConformityWhere(USER_ID), {
    deletedAt: null,
    inspectionResponse: {
      inspection: {
        userId: USER_ID,
        deletedAt: null,
      },
    },
  });
});
