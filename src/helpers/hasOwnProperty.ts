/**
 * JS hasOwnProperty method wrapped with a type guard
 */
export default function hasOwnProperty<T extends object, TKey extends PropertyKey>(
  obj: T,
  prop: TKey
): obj is T & Record<TKey, unknown> {
  return obj.hasOwnProperty(prop);
}
