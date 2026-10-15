import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistentState } from './usePersistentState';

describe('usePersistentState', () => {
  it('저장된 값이 있으면 초기값 대신 저장된 값으로 시작한다', () => {
    localStorage.setItem('rcg:test', JSON.stringify('저장된 값'));
    const { result } = renderHook(() => usePersistentState('rcg:test', '초기값'));
    expect(result.current[0]).toBe('저장된 값');
  });

  it('값을 바꾸면 localStorage에 저장한다', () => {
    const { result } = renderHook(() => usePersistentState('rcg:test', 'google'));
    act(() => result.current[1]('anthropic'));
    expect(JSON.parse(localStorage.getItem('rcg:test')!)).toBe('anthropic');
  });
});
