import type { CSSProperties } from './css';

export type Variant<T> = {
  [K in keyof T]: {
    [key: string]: string | (CSSProperties & { $class?: string });
  } & {
    options?: {
      default?: T[K];
      required?: boolean;
      mediaPrefix?: boolean;
      readonly type?: T[K];
    };
  };
};

export type Variants<T> = T extends Record<string, any> ? Variant<T> : any;
