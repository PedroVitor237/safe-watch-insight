# Diagrama de Classes — versão técnica

O diagrama representa o domínio persistido após a adoção de versões publicadas
e snapshot relacional por inspeção. `ChecklistItem` e
`ChecklistItemStandard` aparecem apenas como estruturas legadas de
compatibilidade; novas inspeções não dependem delas.

```mermaid
classDiagram

class User {
  +UUID id
  +String name
  +String email
  +UserRole role
}

class Company {
  +UUID id
  +String corporateName
  +String cnpj
  +String cnae
  +Int riskLevel
}

class Checklist {
  +UUID id
  +String title
  +String description
  +Boolean isTemplate
  +Boolean isActive
}

class ChecklistVersion {
  +UUID id
  +Int versionNumber
  +ChecklistVersionStatus status
  +String title
  +String description
  +Int contentSchemaVersion
  +String contentHash
  +DateTime publishedAt
}

class ChecklistVersionItem {
  +UUID id
  +UUID sourceVersionItemId
  +UUID sourceChecklistItemId
  +String description
  +Int orderIndex
  +Boolean isRequired
}

class ChecklistVersionItemStandard {
  +UUID standardId
  +StandardType type
  +String code
  +String title
  +String summary
  +String officialUrl
}

class ChecklistItem {
  <<legacy>>
  +UUID id
  +String description
  +Int orderIndex
  +Boolean isRequired
}

class Standard {
  +UUID id
  +StandardType type
  +String code
  +String title
  +String summary
  +String officialUrl
  +Boolean isActive
}

class Inspection {
  +UUID id
  +DateTime inspectionDate
  +InspectionStatus status
  +SyncStatus syncStatus
  +String notes
}

class InspectionChecklistSnapshot {
  +UUID id
  +Int sourceVersionNumber
  +String title
  +String description
  +Boolean isTemplate
  +Int snapshotSchemaVersion
  +String contentHash
  +InspectionSnapshotOrigin origin
  +InspectionSnapshotIntegrityStatus integrityStatus
  +DateTime capturedAt
}

class InspectionSnapshotItem {
  +UUID id
  +UUID sourceVersionItemId
  +UUID sourceChecklistItemId
  +String description
  +Int orderIndex
  +Boolean isRequired
}

class InspectionSnapshotItemStandard {
  +UUID standardId
  +StandardType type
  +String code
  +String title
  +String summary
  +String officialUrl
}

class InspectionResponse {
  +UUID id
  +UUID snapshotItemId
  +UUID checklistItemId
  +ResponseStatus status
  +String observation
  +DateTime clientUpdatedAt
}

class OfflineSyncOperation {
  +UUID id
  +UUID userId
  +UUID inspectionId
  +OfflineOperationType type
  +String payloadHash
  +DateTime clientCreatedAt
  +DateTime completedAt
}

class OfflineOperationType {
  <<enumeration>>
  SAVE_INSPECTION_RESPONSE
  FINISH_INSPECTION
}

class NonConformity {
  +UUID id
  +String description
  +Severity severity
  +DateTime dueDate
  +NonConformityStatus status
}

class CorrectiveAction {
  +UUID id
  +String description
  +String responsible
  +DateTime dueDate
  +CorrectiveActionStatus status
  +DateTime completedAt
}

class Evidence {
  +UUID id
  +UUID inspectionId
  +UUID nonConformityId
  +String publicId
  +String storageUrl
  +String fileName
  +String mimeType
  +BigInt fileSize
  +Int width
  +Int height
  +String caption
  +DateTime createdAt
  +DateTime updatedAt
  +DateTime deletedAt
}

class Report {
  +UUID id
  +Int version
  +DateTime generatedAt
}

class ChecklistVersionStatus {
  <<enumeration>>
  DRAFT
  PUBLISHED
  RETIRED
}

class InspectionSnapshotOrigin {
  <<enumeration>>
  INSPECTION_CREATION
  LEGACY_BACKFILL
}

class InspectionSnapshotIntegrityStatus {
  <<enumeration>>
  VERIFIED
  UNVERIFIED_LEGACY
}

User "1" --> "0..*" Company : creates
User "1" --> "0..*" Checklist : creates
User "1" --> "0..*" ChecklistVersion : creates/publishes
User "1" --> "0..*" Inspection : performs

Company "1" --> "0..*" Inspection
Checklist "1" *-- "1..*" ChecklistVersion
ChecklistVersion "1" *-- "0..*" ChecklistVersionItem
ChecklistVersionItem "1" *-- "0..*" ChecklistVersionItemStandard
Standard "1" --> "0..*" ChecklistVersionItemStandard
ChecklistVersionItem "1" --> "0..*" ChecklistVersionItem : lineage

Inspection --> Checklist
Inspection --> ChecklistVersion : source
Inspection "1" *-- "1" InspectionChecklistSnapshot
InspectionChecklistSnapshot --> Checklist : source
InspectionChecklistSnapshot --> ChecklistVersion : source
InspectionChecklistSnapshot "1" *-- "0..*" InspectionSnapshotItem
InspectionSnapshotItem --> ChecklistVersionItem : lineage
InspectionSnapshotItem "1" *-- "0..*" InspectionSnapshotItemStandard
Standard "1" --> "0..*" InspectionSnapshotItemStandard

Inspection "1" *-- "0..*" InspectionResponse
User "1" --> "0..*" OfflineSyncOperation
Inspection "1" --> "0..*" OfflineSyncOperation
OfflineSyncOperation --> OfflineOperationType
InspectionResponse --> InspectionSnapshotItem : answers
InspectionResponse "1" --> "0..1" NonConformity
NonConformity "1" --> "0..*" CorrectiveAction
Inspection "1" --> "0..*" Evidence
NonConformity "1" --> "0..*" Evidence
Inspection "1" --> "0..1" Report

Checklist "1" --> "0..*" ChecklistItem : legacy
ChecklistItem "1" --> "0..*" InspectionResponse : legacy compatibility
```
