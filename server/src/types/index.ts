export type SchemaFields<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

export type GamePhase = "lobby" | "game"