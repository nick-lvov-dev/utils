import { useCallback, useEffect, useRef } from 'react';
import { Falsy } from '../../types';
import { useSmartDepState } from '../useSmartDepState';
import { sleep } from '../../helpers/sleep';
import { hasOwnProperty } from '../../helpers/hasOwnProperty';

type Props<T> = {
  fetcher: (() => Promise<T>) | Falsy;
  placeholderData?: T;
  maxRetryCount?: number;
  retryWaitPeriodMs?: number;
};

type State<T> = {
  data?: T;
  errorMessage?: string;
  isLoading: boolean;
};

/**
 * Simple hook to abstract fetching logic <br />
 * Provides loading state, retry & error message logic
 *
 * @param placeholderData initial data to use until real data is fetched
 * @param fetcher function that returns a Promise. Data will not be loaded until a fetcher fn is provided
 * @param maxRetryCount max amount of retries before the hook gives up
 * @param retryWaitPeriodMs ms until next retry is attempted
 */
export const useFetch = <T>({
  placeholderData,
  fetcher,
  maxRetryCount = 5,
  retryWaitPeriodMs = 500,
}: Props<T>) => {
  const { state, setState } = useSmartDepState<State<T>>({
    data: placeholderData,
    errorMessage: undefined,
    isLoading: false,
  });
  const retryCount = useRef(0);

  const fetchData = useCallback(async () => {
    if (!fetcher) return;

    setState({ isLoading: true });
    try {
      const newData = await fetcher();
      retryCount.current = 0;
      setState({ data: newData, errorMessage: undefined, isLoading: false });
    } catch (e) {
      if (retryCount.current < maxRetryCount) {
        retryCount.current++;
        await sleep(retryWaitPeriodMs);
        await fetchData();
        return;
      }

      let errorMessage: string;
      if (
        typeof e === "object" &&
        !!e &&
        hasOwnProperty(e, "message") &&
        typeof e.message === "string"
      ) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      } else {
        errorMessage = "Failed to load data";
      }

      setState({ isLoading: false, errorMessage });
    }
  }, [fetcher, maxRetryCount, retryWaitPeriodMs, setState]);

  useEffect(() => {
    if (!!fetcher) fetchData();
  }, [fetchData]);

  return state;
};
