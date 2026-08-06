import { createHash } from "node:crypto";
import process from "node:process";

import { z } from "zod";

import { ApiError, StorageError } from "@/server/errors";

import type { StorageService, StorageUploadInput, StoredFileMetadata } from "./storage.service";

const cloudinaryConfigSchema = z.object({
  cloudName: z.string().trim().min(1),
  apiKey: z.string().trim().min(1),
  apiSecret: z.string().trim().min(1),
  folder: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-zA-Z0-9/_-]+$/),
});

const cloudinaryUploadResponseSchema = z.object({
  public_id: z.string().min(1),
  secure_url: z
    .string()
    .url()
    .refine((value) => new URL(value).protocol === "https:"),
  bytes: z.number().int().nonnegative(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  resource_type: z.literal("image"),
});

const cloudinaryDestroyResponseSchema = z.object({
  result: z.enum(["ok", "not found"]),
});

export interface CloudinaryStorageConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
}

type FetchImplementation = typeof fetch;
type ConfigProvider = () => CloudinaryStorageConfig;

function getCloudinaryConfig(): CloudinaryStorageConfig {
  const result = cloudinaryConfigSchema.safeParse({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER ?? "safe-watch-insight/evidence",
  });

  if (!result.success) {
    throw new ApiError({
      message: "Evidence storage is not configured on the server.",
      statusCode: 500,
      code: "STORAGE_CONFIGURATION_ERROR",
    });
  }

  return result.data;
}

function createSignature(parameters: Record<string, string>, apiSecret: string): string {
  const canonicalParameters = Object.entries(parameters)
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${canonicalParameters}${apiSecret}`).digest("hex");
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export class CloudinaryStorageService implements StorageService {
  constructor(
    private readonly configProvider: ConfigProvider = getCloudinaryConfig,
    private readonly fetchImplementation: FetchImplementation = fetch,
  ) {}

  async upload(input: StorageUploadInput): Promise<StoredFileMetadata> {
    const config = this.configProvider();
    const timestamp = Math.floor(Date.now() / 1_000).toString();
    const publicId = `${config.folder}/${input.key}`;
    const signedParameters = {
      overwrite: "false",
      public_id: publicId,
      timestamp,
    };
    const fileBytes = new Uint8Array(input.bytes.byteLength);
    const formData = new FormData();

    fileBytes.set(input.bytes);
    formData.set("file", new Blob([fileBytes.buffer], { type: input.mimeType }), input.fileName);
    formData.set("api_key", config.apiKey);
    formData.set("overwrite", signedParameters.overwrite);
    formData.set("public_id", signedParameters.public_id);
    formData.set("timestamp", timestamp);
    formData.set("signature", createSignature(signedParameters, config.apiSecret));

    let response: Response;

    try {
      response = await this.fetchImplementation(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`,
        {
          method: "POST",
          body: formData,
          signal: AbortSignal.timeout(15_000),
        },
      );
    } catch {
      throw new StorageError();
    }

    const responseBody = await readJson(response);
    const parsedResponse = cloudinaryUploadResponseSchema.safeParse(responseBody);

    if (
      !response.ok ||
      !parsedResponse.success ||
      parsedResponse.data.public_id !== publicId ||
      parsedResponse.data.bytes !== input.bytes.byteLength
    ) {
      throw new StorageError("Cloudinary could not store the evidence image.");
    }

    return {
      publicId: parsedResponse.data.public_id,
      storageUrl: parsedResponse.data.secure_url,
      fileSize: parsedResponse.data.bytes,
      width: parsedResponse.data.width ?? null,
      height: parsedResponse.data.height ?? null,
    };
  }

  async remove(publicId: string): Promise<void> {
    const config = this.configProvider();
    const timestamp = Math.floor(Date.now() / 1_000).toString();
    const signedParameters = {
      invalidate: "true",
      public_id: publicId,
      timestamp,
    };
    const formData = new FormData();

    formData.set("api_key", config.apiKey);
    formData.set("invalidate", signedParameters.invalidate);
    formData.set("public_id", publicId);
    formData.set("timestamp", timestamp);
    formData.set("signature", createSignature(signedParameters, config.apiSecret));

    let response: Response;

    try {
      response = await this.fetchImplementation(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/destroy`,
        {
          method: "POST",
          body: formData,
          signal: AbortSignal.timeout(15_000),
        },
      );
    } catch {
      throw new StorageError();
    }

    const responseBody = await readJson(response);
    const parsedResponse = cloudinaryDestroyResponseSchema.safeParse(responseBody);

    if (!response.ok || !parsedResponse.success) {
      throw new StorageError("Cloudinary could not remove the evidence image.");
    }
  }
}

export const cloudinaryStorageService = new CloudinaryStorageService();
