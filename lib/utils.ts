import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { aspectRatioOptions } from "@/constants";

// CN FUNCTION - Classname merger
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ERROR HANDLER - Safely handle different types of errors
export const handleError = (error: unknown): void => {
  if (error instanceof Error) {
    // This is a native JavaScript error (e.g., TypeError, RangeError)
    console.error(error.message);
    throw new Error(`Error: ${error.message}`);
  } else if (typeof error === "string") {
    // This is a string error message
    console.error(error);
    throw new Error(`Error: ${error}`);
  } else {
    // This is an unknown type of error
    console.error(error);
    throw new Error(`Unknown error: ${JSON.stringify(error)}`);
  }
};

// DEBOUNCE FUNCTION
export const debounce = <T extends (...args: Parameters<T>) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// GET IMAGE SIZE
export type AspectRatioKey = keyof typeof aspectRatioOptions;

export const getImageSize = (
  type: string,
  image: { aspectRatio?: AspectRatioKey; width?: number; height?: number },
  dimension: "width" | "height"
): number => {
  if (type === "fill") {
    return (
      aspectRatioOptions[image.aspectRatio as AspectRatioKey]?.[dimension] ||
      1000
    );
  }
  return image?.[dimension] ?? 1000;
};

// DOWNLOAD IMAGE
export const download = (url: string, filename: string): void => {
  if (!url) {
    throw new Error("Resource URL not provided! You need to provide one");
  }

  fetch(url)
    .then((response) => response.blob())
    .then((blob: Blob) => {
      const blobURL = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobURL;

      if (filename && filename.length) {
        a.download = `${filename.replace(/ /g, "_")}.png`;
      }
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a); // Clean up DOM
    })
    .catch((error) => console.error({ error }));
};

// DEEP MERGE OBJECTS
export const deepMergeObjects = <
  T extends Record<string, unknown>,
  U extends Record<string, unknown>
>(
  obj1: T,
  obj2: U
): T & U => {
  if (!obj2) {
    return { ...obj1 } as T & U;
  }

  const output: Record<string, unknown> = { ...obj2 };

  for (const key in obj1) {
    if (Object.prototype.hasOwnProperty.call(obj1, key)) {
      if (
        obj1[key] &&
        typeof obj1[key] === "object" &&
        !Array.isArray(obj1[key]) &&
        obj2[key] &&
        typeof obj2[key] === "object" &&
        !Array.isArray(obj2[key])
      ) {
        output[key] = deepMergeObjects(
          obj1[key] as Record<string, unknown>,
          obj2[key] as Record<string, unknown>
        );
      } else {
        output[key] = obj1[key];
      }
    }
  }

  return output as T & U;
};
