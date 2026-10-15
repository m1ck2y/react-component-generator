import { describe, it, expect } from 'vitest';
import { validatePrompt } from './validation';

describe('validatePrompt', () => {
  it('500자 이하면 null을 반환한다', () => {
    expect(validatePrompt('가'.repeat(500))).toBeNull();
  });

  it('500자를 넘으면 제한 길이를 담은 에러 메시지를 반환한다', () => {
    expect(validatePrompt('가'.repeat(501))).toContain('500자');
  });

  it('이모지 등 서로게이트 쌍 문자도 1자로 센다', () => {
    expect(validatePrompt('😀'.repeat(500))).toBeNull();
  });
});
