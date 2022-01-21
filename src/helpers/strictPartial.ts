export default <T, K extends keyof T>() =>
  <U extends {
    [P in keyof U]-?: P extends keyof T ? T[P] : never
  } & Omit<T, K>>(u: U) => u;