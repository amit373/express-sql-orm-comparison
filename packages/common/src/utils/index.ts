// Utility functions for the project

/**
 * Generates a random string of specified length.
 *
 * @param length - The length of the random string to generate
 * @returns A random string of the specified length
 */
export const generateRandomString = (length: number): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generates a UUID v4 string.
 *
 * @returns A UUID v4 string
 */
export const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.trunc(Math.random() * 16);
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Pauses execution for the specified number of milliseconds.
 *
 * @param ms - Number of milliseconds to sleep
 * @returns A promise that resolves after the specified time
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, or empty object).
 *
 * @param value - The value to check
 * @returns True if the value is empty, false otherwise
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string" && value.trim().length === 0) {
    return true;
  }

  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  if (typeof value === "object" && Object.keys(value).length === 0) {
    return true;
  }

  return false;
};

/**
 * Creates a deep clone of an object.
 *
 * @param obj - The object to clone
 * @returns A deep clone of the object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as T;
  }

  if (typeof obj === "object") {
    const cloned = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        (cloned as any)[key] = deepClone((obj as any)[key]);
      }
    }
    return cloned;
  }

  return obj;
};

/**
 * Formats a date to an ISO string.
 *
 * @param date - The date to format
 * @returns The date formatted as an ISO string
 */
export const formatDate = (date: Date): string => {
  return new Date(date).toISOString();
};

/**
 * Calculates the time difference between two dates in milliseconds.
 *
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns The time difference in milliseconds
 */
export const timeDifference = (startDate: Date, endDate: Date): number => {
  return endDate.getTime() - startDate.getTime();
};

/**
 * Converts a snake_case string to camelCase.
 *
 * @param str - The string to convert
 * @returns The converted string in camelCase
 */
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

/**
 * Converts object keys from snake_case to camelCase.
 *
 * @param obj - The object with snake_case keys
 * @returns A new object with camelCase keys
 */
export const convertObjectKeysToCamel = (obj: any): any => {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return obj;
  }

  const converted: any = {};
  Object.keys(obj).forEach((key) => {
    const camelKey = snakeToCamel(key);
    converted[camelKey] = convertObjectKeysToCamel(obj[key]);
  });

  return converted;
};

/**
 * Creates a debounced function that delays execution.
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
