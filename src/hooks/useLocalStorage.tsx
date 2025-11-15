import { useEffect, useState } from "react";

interface LocalStorageProps<T> {
  key: string;
  defaultValue: T;
}

export function useLocalStorage<T>({
  key,
  defaultValue,
}: LocalStorageProps<T>) {
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue !== null
        ? (JSON.parse(storedValue) as T)
        : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn("useLocalStorage: cannot save to localStorage", err);
    }
  }, [value, key]);

  return [value, setValue] as const;
}

export function useStorage<T extends string>({
  key,
  defaultValue,
}: LocalStorageProps<T>) {
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? (storedValue as T) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue] as const;
}
