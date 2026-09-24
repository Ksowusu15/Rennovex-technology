import "server-only";
import { v2 as cloudinary, 
  type UploadApiResponse } from "cloudinary";

let configured = false;

function ensureConfigured() {
  if (configured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName 
    || !apiKey 
    || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({ cloud_name: cloudName, 
    api_key: apiKey, 
    api_secret: apiSecret, 
    secure: true });
  configured = true;
}

export async function uploadImage(file: File, 
  folder: string): Promise<UploadApiResponse> {
  ensureConfigured();
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, 
    reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `rennovex/${folder}`,
        resource_type: "image",
        overwrite: false,
        unique_filename: true,
        use_filename: false,
        transformation: [{ quality: "auto", 
          fetch_format: "auto" }],
      },
      (error, 
        result) => {
        if (error 
          || !result) {
          reject(error 
            ?? new Error("Cloudinary upload failed."));
          return;
        }
        resolve(result);
      },
    );

    stream.end(buffer);
  });
}

export function getCloudinaryPublicId(url?: string | null): string | null {
  if (!url 
    || !url.includes("res.cloudinary.com")) return null;
  try {
    const pathname = new URL(url).pathname;
    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex < 0) return null;
    let value = pathname.slice(uploadIndex + "/upload/".length);
    value = value.replace(/^v\d+\//, 
      "");
    return decodeURIComponent(value.replace(/\.[^/.]+$/, 
      ""));
  } catch {
    return null;
  }
}

export async function deleteImage(url?: string | null): Promise<void> {
  const publicId = getCloudinaryPublicId(url);
  if (!publicId) return;
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, 
    { resource_type: "image", 
    invalidate: true });
}
