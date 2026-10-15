import { useEffect, useState } from 'react';
import { loadJSON, saveJSON } from '../utils/storage';

/**
 * useState와 같지만 값이 localStorage의 `key`에 저장되어 새로고침 후에도 유지된다.
 * JSON으로 되살릴 수 없는 값(Date 등)은 `revive`로 복원한다.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
  revive: (stored: T) => T = (stored) => stored,
) {
  const state = useState<T>(() => revive(loadJSON(key, initialValue)));
  const [value] = state;

  useEffect(() => {
    saveJSON(key, value);
  }, [key, value]);

  return state;
}
