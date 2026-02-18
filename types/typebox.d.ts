declare module "@sinclair/typebox" {
  export const Type: {
    String: (options?: { description?: string }) => unknown;
    Number: (options?: { description?: string; minimum?: number; maximum?: number }) => unknown;
    Boolean: () => unknown;
    Optional: <T>(type: T) => unknown;
    Object: (properties: Record<string, unknown>, options?: { description?: string }) => unknown;
    Array: <T>(type: T, options?: { description?: string }) => unknown;
    Union: <T extends unknown[]>(types: [...T]) => unknown;
    Literal: <T extends string>(value: T) => unknown;
  };
}
