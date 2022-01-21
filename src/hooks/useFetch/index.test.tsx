import React, { useRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import useFetch from './index';
import sleep from '../../helpers/sleep';

const successData = 'success';
const errorMessage = 'error message';
const fetchSuccess = jest.fn(() => sleep(200).then(() => successData));
const fetchError = jest.fn(() => sleep(200).then(() => Promise.reject(errorMessage)));
const dataTestId = 'data';
const loadingTestId = 'loading';
const renderCountTestId = 'render-count';
const errorTestId = 'error';
const retryCount = 5;

describe('useFetch hook', () => {
  it('should be defined', () => {
    expect(useFetch).toBeDefined();
  });

  it('fetches data on render', async () => {
    const TestComponent = () => {
      const {data} = useFetch({fetcher: fetchSuccess});

      const renderCount = useRef(0);
      renderCount.current++;

      return <>
        <div data-testid={dataTestId}>{data}</div>
        <div data-testid={renderCountTestId}>{renderCount.current}</div>
      </>
    }

    render(<TestComponent />);
    expect(screen.getByTestId(dataTestId)).toHaveTextContent('');
    expect(fetchSuccess).toHaveBeenCalled();
    expect(screen.getByTestId(renderCountTestId)).toHaveTextContent('1');

    await waitFor(() => sleep(500));
    expect(screen.getByTestId(dataTestId)).toHaveTextContent(successData);
    expect(screen.getByTestId(renderCountTestId)).toHaveTextContent('2');
  });

  it('correctly updates loading state', async () => {
    const TestComponent = () => {
      const {data, isLoading} = useFetch({fetcher: fetchSuccess});

      const renderCount = useRef(0);
      renderCount.current++;

      return <>
        <div data-testid={dataTestId}>{data}</div>
        <div data-testid={loadingTestId}>{isLoading.toString()}</div>
        <div data-testid={renderCountTestId}>{renderCount.current}</div>
      </>
    }

    render(<TestComponent />);
    expect(screen.getByTestId(dataTestId)).toHaveTextContent('');
    expect(screen.getByTestId(loadingTestId)).toHaveTextContent('true');
    expect(fetchSuccess).toHaveBeenCalled();
    expect(screen.getByTestId(renderCountTestId)).toHaveTextContent('2');

    await waitFor(() => sleep(500));
    expect(screen.getByTestId(dataTestId)).toHaveTextContent(successData);
    expect(screen.getByTestId(loadingTestId)).toHaveTextContent('false');
    expect(screen.getByTestId(renderCountTestId)).toHaveTextContent('3');
  });

  it('retries data fetch and shows error message', async () => {
    const TestComponent = () => {
      const {errorMessage} = useFetch({fetcher: fetchError, maxRetryCount: retryCount});

      const renderCount = useRef(0);
      renderCount.current++;

      return <>
        <div data-testid={errorTestId}>{errorMessage}</div>
        <div data-testid={renderCountTestId}>{renderCount.current}</div>
      </>
    }

    render(<TestComponent />);
    expect(screen.getByTestId(errorTestId)).toHaveTextContent('');
    expect(fetchError).toHaveBeenCalled();
    expect(screen.getByTestId(renderCountTestId)).toHaveTextContent('1');

    await waitFor(() => expect(fetchError).toHaveBeenCalledTimes(retryCount + 1), {timeout: 4000});
    await waitFor(() => sleep(500));

    expect(screen.getByTestId(errorTestId)).toHaveTextContent(errorMessage);
    expect(screen.getByTestId(renderCountTestId)).toHaveTextContent('2');
  }, 1000000)
});