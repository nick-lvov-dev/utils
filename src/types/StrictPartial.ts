/**
 * Allows missing keys but not explicit undefined unless explicitly allowed
 *
 * @example
 *
 * type T1 = {
 *   a: number;
 *   b: string | undefined;
 * }
 *
 * // we add `extends PartialRecord<T1, unknown>` so the IDE knows what keys to suggest for the arg
 * function testFn<T2 extends PartialRecord<T1, unknown>>(arg: StrictPartial<T1, T2>) { ... }
 *
 * testFn({ a: 1 }) // allowed
 * testFn({ b: undefined }) // allowed
 * testFn({ a: undefined, b: 'string' }) // error: type 'undefined' is not assignable to type 'number'
 */
export type StrictPartial<T extends object, U extends object> =
  {
    [P in keyof U]-?: P extends keyof T ? T[P] : never
  } & Omit<T, Exclude<keyof T, keyof U>>;
