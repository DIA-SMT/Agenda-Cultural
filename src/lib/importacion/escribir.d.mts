import type { ImportPlan } from "./eventon.mjs";

export interface ImportDb {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
  transaction<T>(work: (query: <R = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<R[]>) => Promise<T>): Promise<T>;
}

export declare function writePlan(db: ImportDb, plan: ImportPlan, options?: {
  update?: boolean;
  saveImage?: (url: string) => Promise<string | null>;
}): Promise<{
  created: number;
  updated: number;
  skipped: number;
  withoutDates: number;
  categoriesCreated: number;
  renamed: string[];
  imageErrors: string[];
}>;
