import { useCallback, useMemo, useRef } from 'react';
import { useRerender } from '../useRerender';
import { PartialRecord, StrictPartial } from '../../types';
import { useIsMounted } from '../useIsMounted';

export type UseSmartDepStateComparator = (a: unknown, b: unknown) => boolean;
export type UseSmartDepStateOptions = {
  comparator: UseSmartDepStateComparator;
}

const defaultComparator: UseSmartDepStateComparator = (a, b) => a === b;
const defaultOptions: UseSmartDepStateOptions = {
  comparator: defaultComparator,
}


/**
 * Custom state hook that only triggers rerender when a used state key is updated <br />
 * Not very useful on its own, but could be used in other custom hooks to avoid unnecessary rerenders <br />
 * Inspired by useSWR https://github.com/vercel/swr/blob/main/src/utils/state.ts
 *
 * @param initialState default state, type can be inferred from the argument
 * @param options
 * @param options.comparator function to compare state keys. Defaults to simple ===
 */
export const useSmartDepState = <TState extends object>(
  initialState: TState,
  options: Partial<UseSmartDepStateOptions> = defaultOptions,
) => {
  const {comparator} = useMemo(() => ({...options, ...defaultOptions}), []);
  const rerender = useRerender();
  const stateRef = useRef(initialState);
  const isMountedRef = useIsMounted();

  const stateDependenciesRef = useRef(
    Object.keys(initialState).reduce<Record<keyof TState, boolean>>(
      (acc, val) => ({
        ...acc,
        [val]: false,
      }),
      {} as Record<keyof TState, boolean>
    )
  );

  const setState = useCallback(
    <TNewState extends PartialRecord<keyof TState, unknown>>(newState: StrictPartial<TState, TNewState>) => {
      let shouldRerender = false;

      const currentState = stateRef.current;
      for (const k in newState) {
        if (!comparator(currentState[k], newState[k])) {
          currentState[k] = newState[k];
          if (stateDependenciesRef.current[k]) {
            shouldRerender = true;
          }
        }
      }

      if (shouldRerender && isMountedRef.current) {
        rerender();
      }
    },
    [rerender]
  );

  return useMemo(
    () => ({
      state: new Proxy(stateRef.current, {
        get(target, keyArg) {
          const key = keyArg as keyof TState;
          if (key in stateDependenciesRef.current) {
            stateDependenciesRef.current[key] = true;
          }

          return target[key];
        },
      }),
      setState,
    }),
    [setState]
  );
};
