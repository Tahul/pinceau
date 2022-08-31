export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]>; } : T

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

export type NestedKeyOf<TObject extends object> =
{ [Key in keyof TObject & (string | number)]: TObject[Key] extends object
  ? `${Key}` | `${Key}.${NestedKeyOf<TObject[Key]>}`
  : `${Key}`
}[keyof TObject & (string | number)]

export type WrapUnion<
  TObject extends string,
  TPrefix extends string,
  TSuffix extends string,
> = keyof {
  [K in WrapKey<TObject, TPrefix, TSuffix>]: any
}
