"use client";

import Image from "next/image";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";

export function ServiceImageField({
  currentImage,
}: {
  currentImage?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(
    currentImage || null,
  );
  const [removeCurrent, setRemoveCurrent] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <ImagePlus size={17} className="text-blue-600" />
        <span className="text-sm font-semibold text-slate-800">
          Service image
        </span>
      </div>

      <div className="grid gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 md:grid-cols-[180px_1fr] md:items-center">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-slate-200 bg-white">
          {preview ? (
            <Image
              src={preview}
              alt="Service image preview"
              fill
              className="object-cover"
              unoptimized={preview.startsWith("blob:")}
            />
          ) : (
            <div className="grid h-full place-items-center text-center text-xs text-slate-400">
              <div>
                <ImagePlus className="mx-auto mb-2" size={25} />
                No image selected
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#071d49] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800">
            <Upload size={15} />
            {preview ? "Choose another image" : "Upload image"}
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (!file) return;

                if (objectUrl) URL.revokeObjectURL(objectUrl);

                const nextUrl = URL.createObjectURL(file);
                setObjectUrl(nextUrl);
                setPreview(nextUrl);
                setRemoveCurrent(false);
              }}
            />
          </label>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            JPG, PNG, WEBP or AVIF. Maximum file size: 8 MB.
            A wide 16:10 image works best on the public service cards.
          </p>

          {preview && (
            <button
              type="button"
              onClick={() => {
                if (objectUrl) {
                  URL.revokeObjectURL(objectUrl);
                  setObjectUrl(null);
                }
                setPreview(null);
                setRemoveCurrent(Boolean(currentImage));
              }}
              className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-red-600 transition hover:text-red-700"
            >
              <Trash2 size={14} />
              Remove image
            </button>
          )}

          <input
            type="hidden"
            name="removeImage"
            value={removeCurrent ? "1" : "0"}
          />
        </div>
      </div>
    </div>
  );
}
