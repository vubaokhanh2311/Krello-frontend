import { NotifyService } from "../service/NotifyService";
import { getPayloadNotificationError } from "../utils/getPayloadNotificationError";
import { useCallback, useState, useRef, useEffect } from "react";

export interface UseFetchResult<T, A extends unknown[] = unknown[]> {
  data: T | null;
  loading: boolean;
  fetch: (...args: A) => Promise<T>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export interface UseFetchOptions<T, A extends unknown[]> {
  onSuccess?: (data: T, ...args: A) => void;
  onError?: (error: unknown) => void;
}

export function useFetch<T, A extends unknown[] = unknown[]>(
  apiFn: (...args: A) => Promise<T>,
  options?: UseFetchOptions<T, A>,
): UseFetchResult<T, A> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const fetch = useCallback(
    async (...args: A): Promise<T> => {
      setLoading(true);

      try {
        const result = await apiFn(...args);
        setData(result);
        optionsRef.current?.onSuccess?.(result, ...args);
        return result;
      } catch (err) {
        const payload = getPayloadNotificationError(err);
        NotifyService.error({
          title: payload.message,
          description: payload.description,
        });

        optionsRef.current?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFn],
  );

  return { data, loading, fetch, setData };
}
