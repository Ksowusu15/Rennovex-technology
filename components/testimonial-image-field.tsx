"use client";

import Image from "next/image";
import { Camera, 
  Trash2, 
  Upload } from "lucide-react";
import { useEffect, 
  useState } from "react";

export function TestimonialImageField({ currentImage }: { currentImage?: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentImage 
    || null);
  const [removeCurrent, setRemoveCurrent] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  return (
    <div className="grid gap-3">
      <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Camera 
          size={17} 
          className="text-blue-600" /> 
        Client photo
      </span>
      <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 sm:flex-row sm:items-center">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow">
          {preview ? (
            <Image 
              src={preview} 
              alt="Client preview" 
              fill 
              className="object-cover" 
              unoptimized={preview.startsWith("blob:")} />
          ) : (
            <div className="grid h-full place-items-center text-xs font-semibold text-slate-400">No photo</div>
          )}
        </div>
        <div>
          <label className={`
  inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#071d49]
  px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800
`}>
            <Upload size={15} /> 
            {preview 
              ? "Choose another photo" 
              : "Upload client photo"}
            <input 
              type="file" 
              name="image" 
              accept="image/jpeg,image/png,image/webp,image/avif" 
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (objectUrl) URL.revokeObjectURL(objectUrl);
                const url = URL.createObjectURL(file);
                setObjectUrl(url); 
                setPreview(url); 
                setRemoveCurrent(false);
              }} />
          </label>
          <p className="mt-2 text-xs text-slate-500">JPG, PNG, WEBP or AVIF, up to 8 MB. A square portrait works best.</p>
          {preview && <button 
            type="button" 
            className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-red-600"
            onClick={() => {
              if (objectUrl) URL.revokeObjectURL(objectUrl);
              setObjectUrl(null); 
              setPreview(null); 
              setRemoveCurrent(Boolean(currentImage));
            }}>
            <Trash2 size={14}/>
            Remove photo</button>}
          <input 
            type="hidden" 
            name="removeImage" 
            value={removeCurrent 
              ? "1" 
              : "0"} />
        </div>
      </div>
    </div>
  );
}
