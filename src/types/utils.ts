export type Primitive = string | number | symbol

export type WrapKey<
  TKey,
  TPrefix extends string = '',
  TSuffix extends string = '',
> = TKey extends string
  ? `${TPrefix}${TKey}${TSuffix}`
  : never

export type UnwrapKey<
  TWrappedKey,
  TPrefix extends string = '',
  TSuffix extends string = '',
> = TWrappedKey extends WrapKey<infer TKey, TPrefix, TSuffix>
  ? TKey
  : ''

export type WrappedValue<
  TObject extends object,
  TWrappedKey extends string,
  TPrefix extends string = '',
  TSuffix extends string = '',
> = TObject extends { [K in UnwrapKey<TWrappedKey, TPrefix, TSuffix>]: infer TValue }
  ? TValue
  : never

export type PrefixObjectKeys<
  TObject extends object,
  TPrefix extends string,
> = {
  [K in WrapKey<keyof TObject, TPrefix>]: WrappedValue<TObject, K, TPrefix>
}

export type SuffixObjectKeys<
  TObject extends object,
  TSuffix extends string,
> = {
  [K in WrapKey<keyof TObject, TSuffix>]: WrappedValue<TObject, K, '', TSuffix>
}

export type WrapObjectKeys<
  TObject extends object,
  TPrefix extends string,
  TSuffix extends string,
> = {
  [K in WrapKey<keyof TObject, TPrefix, TSuffix>]: WrappedValue<TObject, K, TPrefix, TSuffix>
}

export type NestedKeyOf<TObject> =
{ [Key in keyof TObject & (string | number)]: TObject[Key] extends object | string
  ? `${Key}` | `${Key}.${NestedKeyOf<TObject[Key]>}`
  : `${Key}`
}[keyof TObject & (string | number)]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type FilterStartingWith<Set, Needle extends string> = Set extends `${Needle}${infer _X}` ? Set : never

export type WrapUnion<
  TObject extends Primitive,
  TPrefix extends string,
  TSuffix extends string,
> = keyof {
  [K in WrapKey<TObject, TPrefix, TSuffix>]: any
}

export interface VueQuery {
  id: string
  filename: string
  vue?: boolean
  src?: boolean
  global?: boolean
  type?: 'script' | 'template' | 'style' | 'custom'
  blockType?: string
  index?: number
  locale?: string
  lang?: string
  raw?: boolean
  scoped?: string
  transformed?: boolean
  issuerPath?: string
  css: boolean
}
