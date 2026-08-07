export class InspectionResponseRevisionConflictError extends Error {
  constructor() {
    super("The server response changed after the offline copy was created.");
    this.name = "InspectionResponseRevisionConflictError";
  }
}

export class OfflineOperationPayloadConflictError extends Error {
  constructor() {
    super("The offline operation ID was already used with different content.");
    this.name = "OfflineOperationPayloadConflictError";
  }
}
