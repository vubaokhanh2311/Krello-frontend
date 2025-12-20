import { useEffect, useState } from "react";
import RestClient from "./RestClient";

export interface UnsplashPhoto {
  id: string;
  small: string;
  full: string;
}

interface UnsplashApiPhoto {
  id: string;
  urls?: {
    small?: string;
    regular?: string;
  };
}

interface UnsplashApiResponse {
  data: UnsplashApiPhoto[] | { results: UnsplashApiPhoto[] };
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
        })) as UnsplashApiResponse;

        console.log("Unsplash response full:", res.data);

        const results = Array.isArray(res.data)
          ? res.data
          : res.data?.results || [];

        if (results.length === 0) {
          console.warn("No photos found for query:", query);
        }

        const data: UnsplashPhoto[] = results.map((p: UnsplashApiPhoto) => ({
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
