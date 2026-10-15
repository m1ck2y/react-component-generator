// 요청 입력을 검증하는 순수 함수들.

export const MAX_PROMPT_LENGTH = 500;

/** 프롬프트가 유효하면 null, 아니면 사용자에게 보여줄 에러 메시지를 반환한다. */
export function validatePrompt(prompt: string): string | null {
  // .length는 UTF-16 코드 유닛 수라 이모지를 2자로 센다. 코드 포인트 단위로 센다.
  if ([...prompt].length > MAX_PROMPT_LENGTH) {
    return `프롬프트는 ${MAX_PROMPT_LENGTH}자 이하로 입력해주세요.`;
  }
  return null;
}
