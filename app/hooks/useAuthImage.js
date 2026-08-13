import { useEffect, useState } from "react";
import { fetchAuthedBlob } from "../../services/mediaService";

export function useAuthImage(url) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!url) return;
    let objectUrl;

    fetchAuthedBlob(url)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => setSrc(null));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return src;
}