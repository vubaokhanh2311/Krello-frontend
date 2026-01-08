import { useEffect, useState } from "react";
import RestClient from "./RestClient";

export interface UnsplashPhoto {
  id: string;
  small: string;
  full: string;
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
        const res = (await RestClient.get(`/unsplash/search`, {
          params: { query, pageSize },
        })) as unknown as { data?: { results?: unknown[] } | unknown[] };

        console.log("Unsplash response full:", res.data);

        const results = Array.isArray(res.data)
          ? res.data
          : (res.data as { results?: unknown[] })?.results || [];

        if (results.length === 0) {
          console.warn("No photos found for query:", query);
        }

        const data: UnsplashPhoto[] = results.map((p: any) => ({
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
  }, [query]);

  return { photos, loading };
};
