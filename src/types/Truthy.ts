import { Falsy } from './Falsy';

export type Truthy<T> = Exclude<T, Falsy>;