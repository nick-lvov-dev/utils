import { Truthy } from '../types';

/**
 * type guard to help with assertions inside some functions like Array.filter
 */
export const isTruthy = <T>(val: T): val is Truthy<T> => !!val;