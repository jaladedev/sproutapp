import { useEffect, useState } from "react";
import { toRelativePath, fetchAuthedBlob } from "../../services/mediaService";

type AuthImageProps = {
  url?: string;
  alt?: string;
  className?: string;
  onBlobReady?: (objectUrl: string) => void;
};

export function AuthImage({ url, alt, className, onBlobReady }: AuthImageProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;
    let objectUrl: string | undefined;
    let cancelled = false;

    setSrc(null);
    setError(false);

    fetchAuthedBlob(toRelativePath(url))
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
        onBlobReady?.(objectUrl);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("AuthImage failed:", err?.response?.status, url);
          setError(true);
        }
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 bg-white/5 text-white/55 ${className}`}>
        <span className="text-lg">⚠</span>
        <span className="text-[10px]">Failed to load</span>
      </div>
    );
  }

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-white/5 ${className}`}>
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} />;
}