import {
  generateRandomString,
  generateUUID,
  sleep,
  isEmpty,
  deepClone,
  formatDate,
  timeDifference,
  snakeToCamel,
  convertObjectKeysToCamel,
  debounce,
} from "../utils";

describe("Utility Functions", () => {
  describe("generateRandomString", () => {
    it("should generate a random string of specified length", () => {
      const result = generateRandomString(10);
      expect(result).toHaveLength(10);
      expect(typeof result).toBe("string");
    });

    it("should generate different strings on each call", () => {
      const result1 = generateRandomString(10);
      const result2 = generateRandomString(10);
      expect(result1).not.toBe(result2);
    });

    it("should handle length of 0", () => {
      const result = generateRandomString(0);
      expect(result).toBe("");
    });
  });

  describe("generateUUID", () => {
    it("should generate a valid UUID v4 string", () => {
      const uuid = generateUUID();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it("should generate different UUIDs on each call", () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe("sleep", () => {
    it("should pause execution for specified time", async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      const diff = end - start;

      expect(diff).toBeGreaterThanOrEqual(95); // Allow some tolerance
    });

    it("should handle 0ms sleep", async () => {
      const start = Date.now();
      await sleep(0);
      const end = Date.now();
      const diff = end - start;

      expect(diff).toBeGreaterThanOrEqual(0);
    });
  });

  describe("isEmpty", () => {
    it("should return true for null", () => {
      expect(isEmpty(null)).toBe(true);
    });

    it("should return true for undefined", () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it("should return true for empty string", () => {
      expect(isEmpty("")).toBe(true);
    });

    it("should return true for whitespace-only string", () => {
      expect(isEmpty("   ")).toBe(true);
    });

    it("should return false for non-empty string", () => {
      expect(isEmpty("hello")).toBe(false);
    });

    it("should return true for empty array", () => {
      expect(isEmpty([])).toBe(true);
    });

    it("should return false for non-empty array", () => {
      expect(isEmpty([1, 2, 3])).toBe(false);
    });

    it("should return true for empty object", () => {
      expect(isEmpty({})).toBe(true);
    });

    it("should return false for non-empty object", () => {
      expect(isEmpty({ key: "value" })).toBe(false);
    });

    it("should return false for number", () => {
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(42)).toBe(false);
    });

    it("should return false for boolean", () => {
      expect(isEmpty(true)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });

  describe("deepClone", () => {
    it("should clone primitive values correctly", () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone("hello")).toBe("hello");
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
    });

    it("should clone arrays correctly", () => {
      const original = [1, 2, [3, 4], { a: 5 }];
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[2]).not.toBe(original[2]);
      expect(cloned[3]).not.toBe(original[3]);
    });

    it("should clone objects correctly", () => {
      const original = { a: 1, b: { c: 2, d: [3, 4] } };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.b.d).not.toBe(original.b.d);
    });

    it("should clone dates correctly", () => {
      const original = new Date("2023-01-01");
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned instanceof Date).toBe(true);
    });

    it("should handle nested objects and arrays", () => {
      const original = {
        level1: {
          level2: {
            level3: [1, 2, { deep: "value" }],
          },
        },
      };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.level1).not.toBe(original.level1);
      expect(cloned.level1.level2).not.toBe(original.level1.level2);
      expect(cloned.level1.level2.level3).not.toBe(
        original.level1.level2.level3,
      );
      expect(cloned.level1.level2.level3[2]).not.toBe(
        original.level1.level2.level3[2],
      );
    });
  });

  describe("formatDate", () => {
    it("should format date to ISO string", () => {
      const date = new Date("2023-01-01T10:00:00.000Z");
      const formatted = formatDate(date);

      expect(formatted).toBe("2023-01-01T10:00:00.000Z");
    });

    it("should handle different date formats", () => {
      const date = new Date();
      const formatted = formatDate(date);

      expect(typeof formatted).toBe("string");
      expect(formatted).toContain("T");
      expect(formatted).toContain("Z");
    });
  });

  describe("timeDifference", () => {
    it("should calculate time difference in milliseconds", () => {
      const startDate = new Date("2023-01-01T10:00:00.000Z");
      const endDate = new Date("2023-01-01T10:00:05.000Z");

      const diff = timeDifference(startDate, endDate);
      expect(diff).toBe(5000);
    });

    it("should handle negative differences", () => {
      const startDate = new Date("2023-01-01T10:00:05.000Z");
      const endDate = new Date("2023-01-01T10:00:00.000Z");

      const diff = timeDifference(startDate, endDate);
      expect(diff).toBe(-5000);
    });
  });

  describe("snakeToCamel", () => {
    it("should convert snake_case to camelCase", () => {
      expect(snakeToCamel("snake_case")).toBe("snakeCase");
      expect(snakeToCamel("user_name")).toBe("userName");
      expect(snakeToCamel("first_name_last_name")).toBe("firstNameLastName");
    });

    it("should handle single word", () => {
      expect(snakeToCamel("word")).toBe("word");
    });

    it("should handle empty string", () => {
      expect(snakeToCamel("")).toBe("");
    });
  });

  describe("convertObjectKeysToCamel", () => {
    it("should convert object keys from snake_case to camelCase", () => {
      const original = {
        user_name: "John",
        last_login: "2023-01-01",
        profile_data: {
          first_name: "John",
          last_name: "Doe",
          contact_info: {
            email_address: "john@example.com",
          },
        },
      };

      const converted = convertObjectKeysToCamel(original);

      expect(converted).toEqual({
        userName: "John",
        lastLogin: "2023-01-01",
        profileData: {
          firstName: "John",
          lastName: "Doe",
          contactInfo: {
            emailAddress: "john@example.com",
          },
        },
      });
    });

    it("should handle arrays of objects", () => {
      const original = [
        { user_id: 1, user_name: "John" },
        { user_id: 2, user_name: "Jane" },
      ];

      const converted = convertObjectKeysToCamel(original);

      expect(converted).toEqual([
        { userId: 1, userName: "John" },
        { userId: 2, userName: "Jane" },
      ]);
    });

    it("should return non-objects unchanged", () => {
      expect(convertObjectKeysToCamel(null)).toBe(null);
      expect(convertObjectKeysToCamel("string")).toBe("string");
      expect(convertObjectKeysToCamel(42)).toBe(42);
      expect(convertObjectKeysToCamel([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe("debounce", () => {
    jest.useFakeTimers();

    it("should debounce function calls", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn(1);
      debouncedFn(2);
      debouncedFn(3);

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(3);
    });

    it("should call function again after delay", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn(1);
      jest.advanceTimersByTime(50);
      debouncedFn(2);
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(2);
    });

    jest.useRealTimers();
  });
});
