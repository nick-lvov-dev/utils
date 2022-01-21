export default <T extends object>(enumType: T, value: unknown): value is T[keyof T] =>
  typeof value === 'string' && Object.values(enumType).includes(value);
