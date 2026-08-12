"use client";

import { useState, useCallback, useMemo } from "react";
import Cropper from "react-easy-crop";
import { X, ZoomIn, Check, RectangleHorizontal, Square } from "lucide-react";

const ID_CARD_ASPECT = 1.586; // standard ID card ratio (85.6mm × 54mm)

/**
 * Reads a crop area (in source-image pixels) off an <img> and returns a Blob.
 */
async function getCroppedBlob(imageSrc, cropPixels, mimeType) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Crop failed"))),
      mimeType,
      0.95
    );
  });
}

/**
 * Full-screen crop step shown between file selection and compression.
 *
 * props:
 *  - file: the raw File the user just picked/captured
 *  - onCancel(): user backed out — go back to the drop zone empty-handed
 *  - onConfirm(croppedFile): user is happy with the crop
 */
export default function CropModal({ file, onCancel, onConfirm }) {
  const imageSrc = useMemo(() => URL.createObjectURL(file), [file]);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [freeform, setFreeform] = useState(false);
  const [croppedPixels, setCroppedPixels] = useState(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_area, areaPixels) => {
    setCroppedPixels(areaPixels);
  }, []);

  const handleCancel = () => {
    URL.revokeObjectURL(imageSrc);
    onCancel();
  };

  const handleConfirm = async () => {
    if (!croppedPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedPixels, file.type);
      const cropped = new File([blob], file.name, {
        type: file.type,
        lastModified: Date.now(),
      });
      URL.revokeObjectURL(imageSrc);
      onConfirm(cropped);
    } catch {
      // If cropping fails for any reason, fall back to the original file
      // rather than blocking the user's KYC submission.
      URL.revokeObjectURL(imageSrc);
      onConfirm(file);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <p className="text-white/70 text-sm font-semibold">Crop photo</p>
        <button
          type="button"
          onClick={handleCancel}
          className="text-white/40 hover:text-white/70 p-1.5 touch-manipulation"
        >
          <X size={18} />
        </button>
      </div>

      {/* Cropper */}
      <div className="relative flex-1 min-h-0">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={freeform ? undefined : ID_CARD_ASPECT}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          objectFit="contain"
        />
      </div>

      {/* Controls */}
      <div className="shrink-0 border-t border-white/10 bg-black/60 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] space-y-3">
        {/* Aspect toggle */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setFreeform(false)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors touch-manipulation ${
              !freeform
                ? "bg-amber-500 text-black"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            <RectangleHorizontal size={13} />
            ID card
          </button>
          <button
            type="button"
            onClick={() => setFreeform(true)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors touch-manipulation ${
              freeform
                ? "bg-amber-500 text-black"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            <Square size={13} />
            Free
          </button>
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3">
          <ZoomIn size={14} className="text-white/30 shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-amber-500 touch-manipulation"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 font-semibold text-sm py-3 transition-all touch-manipulation"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving || !croppedPixels}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm py-3 transition-all touch-manipulation"
          >
            <Check size={15} />
            {saving ? "Saving…" : "Use photo"}
          </button>
        </div>
      </div>
    </div>
  );
}