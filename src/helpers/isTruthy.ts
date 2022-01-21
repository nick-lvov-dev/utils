import { Truthy } from '../types';

/**
 * type guard to help with assertions inside some functions like Array.filter
 */
export default <T>(val: T): val is Truthy<T> => !!val;