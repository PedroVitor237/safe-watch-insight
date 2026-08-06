export interface StorageUploadInput {
  key: string;
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
}

export interface StoredFileMetadata {
  publicId: string;
  storageUrl: string;
  fileSize: number;
  width: number | null;
  height: number | null;
}

export interface StorageService {
  upload(input: StorageUploadInput): Promise<StoredFileMetadata>;
  remove(publicId: string): Promise<void>;
}
