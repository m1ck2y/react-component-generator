import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';

afterEach(() => {
  vi.unstubAllGlobals();
});

const stubGenerateApi = (code: string) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code }) }),
  );
};

/** 컴포넌트 하나를 생성한 뒤 훅을 언마운트하고 새로 마운트(=새로고침)한 결과를 돌려준다. */
const generateThenReload = async () => {
  stubGenerateApi('render(<Card />);');
  const first = renderHook(() => useComponentGenerator());
  await act(() => first.result.current.generate('카드 만들어줘', undefined, 'google'));
  first.unmount();
  return renderHook(() => useComponentGenerator()).result;
};

describe('useComponentGenerator 영속화', () => {
  it('새로고침 후에도 생성된 컴포넌트 목록이 유지된다', async () => {
    const result = await generateThenReload();
    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0]).toMatchObject({
      prompt: '카드 만들어줘',
      code: 'render(<Card />);',
    });
  });

  it('복원된 컴포넌트의 createdAt은 Date 객체다', async () => {
    const result = await generateThenReload();
    expect(result.current.components[0].createdAt).toBeInstanceOf(Date);
  });
});
