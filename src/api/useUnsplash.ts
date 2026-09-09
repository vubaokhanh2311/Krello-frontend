import { useEffect, useState } from "react";
import RestClient from "./RestClient";

export interface UnsplashPhoto {
  id: string;
  small: string;
  full: string;
}

interface RawUnsplashPhoto {
  id: string;
  urls?: {
    small?: string;
    regular?: string;
  };
}

export const useUnsplash = (query = "landscape", pageSize = 8) => {
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    let isMounted = true;
    setLoading(true);

    const fetchPhotos = async () => {
      try {
        const res = await RestClient.get<RawUnsplashPhoto[] | { data?: RawUnsplashPhoto[]; results?: RawUnsplashPhoto[] }>(`/unsplash/search`, {
          params: { query, pageSize },
        });

        console.log("Unsplash response full:", res);

        const results: RawUnsplashPhoto[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : res?.results || [];

        if (results.length === 0) {
          console.warn("No photos found for query:", query);
        }

        const data: UnsplashPhoto[] = results.map((p: RawUnsplashPhoto) => ({
          id: p.id,
          small: p.urls?.small
            ? `${p.urls.small}&auto=format&fit=crop&w=400`
            : "",
          full: p.urls?.regular ? `${p.urls.regular}&auto=format` : "",
        }));

        if (isMounted) setPhotos(data);
      } catch (error) {
        console.error("Error fetching Unsplash:", error);
        if (isMounted) setPhotos([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPhotos();

    return () => {
      isMounted = false;
    };
  }, [query, pageSize]);

  return { photos, loading };
};
