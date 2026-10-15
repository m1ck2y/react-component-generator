import { describe, it, expect } from 'vitest';
import { addToHistory } from './promptHistory';

describe('addToHistory', () => {
  it('새 프롬프트를 맨 앞에 추가한다', () => {
    expect(addToHistory(['이전'], '새 프롬프트')).toEqual(['새 프롬프트', '이전']);
  });

  it('이미 있는 프롬프트는 중복 없이 맨 앞으로 옮긴다', () => {
    expect(addToHistory(['B', 'A', 'C'], 'A')).toEqual(['A', 'B', 'C']);
  });

  it('10개를 넘으면 가장 오래된 프롬프트를 버린다', () => {
    const ten = Array.from({ length: 10 }, (_, i) => `p${i}`);
    const result = addToHistory(ten, 'new');
    expect(result).toHaveLength(10);
    expect(result[0]).toBe('new');
    expect(result).not.toContain('p9');
  });
});
