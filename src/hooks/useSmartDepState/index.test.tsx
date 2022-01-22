import React, { useRef } from 'react';
import { useSmartDepState } from './index';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

const relevantStateUpdateBtnLabel = 'Update relevant state';
const irrelevantStateUpdateBtnLabel = 'Update irrelevant state';
const TestRenderCountComponent = () => {
  const { state: { relevantKey }, setState } = useSmartDepState({relevantKey: 0, irrelevantKey: 0})

  const renderCount = useRef(0);
  renderCount.current++;

  return <>
    <span>Render count: {renderCount.current}</span>
    <span>Relevant key: {relevantKey}</span>
    <button onClick={() => setState({irrelevantKey: 1})}>{irrelevantStateUpdateBtnLabel}</button>
    <button onClick={() => setState({relevantKey: 1})}>{relevantStateUpdateBtnLabel}</button>
  </>
}

describe('useSmartDepState hook', () => {
  it('should be defined', () => {
    expect(useSmartDepState).toBeDefined();
  });

  it('rerenders component when relevant state key is updated', () => {
    render(<TestRenderCountComponent />);
    expect(screen.getByText(/Render count/)).toHaveTextContent('1');
    expect(screen.getByText(/Relevant key/)).toHaveTextContent('0');
    fireEvent.click(screen.getByText(relevantStateUpdateBtnLabel));
    expect(screen.getByText(/Render count/)).toHaveTextContent('2');
    expect(screen.getByText(/Relevant key/)).toHaveTextContent('1');
  });

  it('does not rerender component when relevant state key is updated', () => {
    render(<TestRenderCountComponent />);
    expect(screen.getByText(/Render count/)).toHaveTextContent('1');
    expect(screen.getByText(/Relevant key/)).toHaveTextContent('0');
    fireEvent.click(screen.getByText(irrelevantStateUpdateBtnLabel));
    expect(screen.getByText(/Render count/)).toHaveTextContent('1');
  });
});