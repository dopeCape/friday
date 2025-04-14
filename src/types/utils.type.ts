
export type WithoutId<T> = {
  [K in keyof T as K extends '_id' ? never : K]: T[K]
}

