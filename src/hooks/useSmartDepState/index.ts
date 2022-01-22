import { useCallback, useMemo, useRef } from 'react';
import { useRerender } from '../useRerender';
import { PartialRecord, StrictPartial } from '../../types';

export type UseSmartDepStateComparator = (a: unknown, b: unknown) => boolean;

const defaultComparator: UseSmartDepStateComparator = (a, b) => a === b;

/**
 * Custom state hook that only triggers rerender when a used state key is updated <br />
 * Not very useful on its own, but could be used in other custom hooks to avoid unnecessary rerenders <br />
 * Inspired by useSWR https://github.com/vercel/swr/blob/main/src/utils/state.ts
 *
 * @param initialState default state, type can be inferred from the argument
 * @param comparator function to compare state keys. Defaults to simple ===
 */
export const useSmartDepState = <TState extends object>(
  initialState: TState,
  comparator = defaultComparator
) => {
  const rerender = useRerender();
  const stateRef = useRef(initialState);

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

      if (shouldRerender) {
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
