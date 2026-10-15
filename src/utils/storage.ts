// localStorage에 JSON 값을 읽고 쓰는 유틸.
// 시크릿 모드·저장소 차단·깨진 값이 있어도 앱이 멈추지 않도록 실패는 조용히 흡수한다.

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패는 무시한다. 새로고침 후 복원만 안 될 뿐 현재 세션은 정상 동작한다.
  }
}
