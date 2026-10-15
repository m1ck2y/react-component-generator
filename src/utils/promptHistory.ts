// 최근 프롬프트 히스토리를 다루는 순수 함수.

export const MAX_HISTORY = 10;

/** 프롬프트를 맨 앞에 두고, 중복은 제거하며, 최근 MAX_HISTORY개만 남긴다. */
export function addToHistory(history: string[], prompt: string): string[] {
  return [prompt, ...history.filter((item) => item !== prompt)].slice(0, MAX_HISTORY);
}
