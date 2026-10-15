import { useState } from 'react';
import { validatePrompt } from '../utils/validation';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  history?: string[];
}

const EXAMPLES = [
  'SaaS 관리자용 KPI 카드 3개. 매출, 활성 사용자, 전환율을 비교 가능한 형태로 표시',
  '설정 페이지의 알림 토글 패널. 이메일, 슬랙, 주간 리포트 옵션 포함',
  '검색 필터 바. 상태, 담당자, 날짜 범위를 선택하고 결과 수를 보여주는 UI',
  '온보딩 체크리스트. 5단계 진행률과 완료/대기 상태를 보여주는 카드',
  '요금제 비교 카드 3개. 추천 플랜을 강조하고 CTA 버튼 포함',
  '테이블 행 상세보기 패널. 선택한 고객의 기본 정보와 최근 활동 표시',
];

export function PromptInput({ onGenerate, isLoading, history = [] }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  // 제출 시 trim한 값을 보내므로 같은 값으로 검증한다.
  const trimmedPrompt = prompt.trim();
  const validationError = validatePrompt(trimmedPrompt);
  const canSubmit = !!trimmedPrompt && !isLoading && !validationError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onGenerate(trimmedPrompt);
    }
  };

  const fillPrompt = (text: string) => {
    setPrompt(text);
  };

  return (
    <div className="prompt-section">
      <div className="prompt-heading">
        <span className="panel-kicker">Prompt</span>
        <h2>무엇을 만들까요?</h2>
      </div>
      <form onSubmit={handleSubmit} className="prompt-form">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="예: 고객 목록 테이블 위에 들어갈 검색 필터 바를 만들어줘. 상태, 담당자, 날짜 범위 필터가 필요해."
          className="prompt-textarea"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          className="btn-generate"
          disabled={!canSubmit}
        >
          {isLoading ? (
            <span className="loading-spinner">생성 중...</span>
          ) : (
            '컴포넌트 생성'
          )}
        </button>
      </form>
      {validationError && (
        <p className="prompt-error" role="alert">
          {validationError}
        </p>
      )}
      {history.length > 0 && (
        <div className="prompt-examples" role="group" aria-label="최근 프롬프트">
          <span className="examples-label">최근 프롬프트</span>
          {history.map((item) => (
            <button
              key={item}
              className="example-chip"
              onClick={() => fillPrompt(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      )}
      <div className="prompt-examples">
        <span className="examples-label">예시 프롬프트</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            className="example-chip"
            onClick={() => fillPrompt(example)}
            type="button"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
