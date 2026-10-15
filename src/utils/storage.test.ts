import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadJSON, saveJSON } from './storage';

afterEach(() => {
  vi.restoreAllMocks();
});

// 시크릿 모드·저장소 차단 환경을 흉내 낸다.
const denied = () => {
  throw new DOMException('denied', 'SecurityError');
};

describe('loadJSON', () => {
  it('저장된 값이 없으면 기본값을 반환한다', () => {
    expect(loadJSON('missing', ['기본'])).toEqual(['기본']);
  });

  it('saveJSON으로 저장한 값을 그대로 읽어온다', () => {
    saveJSON('key', { provider: 'google', items: [1, 2] });
    expect(loadJSON('key', null)).toEqual({ provider: 'google', items: [1, 2] });
  });

  it('저장된 값이 깨진 JSON이면 기본값을 반환한다', () => {
    localStorage.setItem('broken', '{not json');
    expect(loadJSON('broken', 'fallback')).toBe('fallback');
  });

  it('localStorage 읽기가 막혀 있으면 기본값을 반환한다', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(denied);
    expect(loadJSON('key', 'fallback')).toBe('fallback');
  });
});

describe('saveJSON', () => {
  it('localStorage 쓰기가 막혀 있어도 예외를 던지지 않는다', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(denied);
    expect(() => saveJSON('key', 1)).not.toThrow();
  });
});
