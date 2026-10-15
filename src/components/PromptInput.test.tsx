import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptInput } from './PromptInput';

describe('PromptInput', () => {
  it('프롬프트가 비어 있으면 생성 버튼이 비활성이다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
  });

  it('입력하면 버튼이 활성화되고 클릭 시 입력값으로 onGenerate가 호출된다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    await user.type(screen.getByRole('textbox'), '프로필 카드');
    const submit = screen.getByRole('button', { name: '컴포넌트 생성' });
    expect(submit).toBeEnabled();

    await user.click(submit);
    expect(onGenerate).toHaveBeenCalledWith('프로필 카드');
  });

  it('로딩 중에는 생성 버튼이 비활성이고 "생성 중..." 을 보여준다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={true} />);
    expect(screen.getByRole('button', { name: '생성 중...' })).toBeDisabled();
  });

  describe('500자 제한', () => {
    const enterPrompt = async (text: string) => {
      const user = userEvent.setup();
      await user.click(screen.getByRole('textbox'));
      await user.paste(text);
      return user;
    };

    it('500자를 넘으면 에러 메시지를 보여준다', async () => {
      render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
      await enterPrompt('가'.repeat(501));
      expect(screen.getByRole('alert')).toHaveTextContent('500자');
    });

    it('500자를 넘으면 생성 버튼이 비활성이다', async () => {
      render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
      await enterPrompt('가'.repeat(501));
      expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
    });

    it('500자를 넘으면 Ctrl+Enter로도 제출되지 않는다', async () => {
      const onGenerate = vi.fn();
      render(<PromptInput onGenerate={onGenerate} isLoading={false} />);
      const user = await enterPrompt('가'.repeat(501));
      await user.keyboard('{Control>}{Enter}{/Control}');
      expect(onGenerate).not.toHaveBeenCalled();
    });

    it('앞뒤 공백을 제외하고 500자 이하면 제출할 수 있다', async () => {
      render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
      await enterPrompt(`  ${'가'.repeat(500)}  `);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeEnabled();
    });
  });

  describe('최근 프롬프트', () => {
    it('히스토리 항목을 최근 프롬프트 버튼으로 보여준다', () => {
      render(
        <PromptInput onGenerate={vi.fn()} isLoading={false} history={['로그인 폼', '프로필 카드']} />,
      );
      const recent = screen.getByRole('group', { name: '최근 프롬프트' });
      expect(within(recent).getAllByRole('button').map((b) => b.textContent)).toEqual([
        '로그인 폼',
        '프로필 카드',
      ]);
    });

    it('최근 프롬프트를 클릭하면 입력창에 채운다', async () => {
      const user = userEvent.setup();
      render(<PromptInput onGenerate={vi.fn()} isLoading={false} history={['로그인 폼']} />);
      await user.click(screen.getByRole('button', { name: '로그인 폼' }));
      expect(screen.getByRole('textbox')).toHaveValue('로그인 폼');
    });
  });
});
