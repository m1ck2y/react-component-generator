import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  // /api/config 응답: 서버(.env) 키 없음
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ envKeys: { anthropic: false, google: false } }),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** 앱을 언마운트하고 다시 렌더링해 새로고침을 흉내 낸다. */
const reload = (unmount: () => void) => {
  unmount();
  render(<App />);
};

describe('App 설정 유지', () => {
  it('선택한 Provider가 새로고침 후에도 유지된다', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.selectOptions(screen.getByLabelText('Provider'), 'anthropic');

    reload(unmount);
    expect(screen.getByLabelText('Provider')).toHaveValue('anthropic');
  });
});

describe('API 키 저장', () => {
  it('키 저장을 켜면 새로고침 후에도 API 키가 복원된다', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.click(screen.getByLabelText('이 브라우저에 키 저장'));
    await user.type(screen.getByLabelText('API Key'), 'test-key-123');

    reload(unmount);
    expect(screen.getByLabelText('API Key')).toHaveValue('test-key-123');
  });

  it('키 저장이 꺼져 있으면(기본값) 새로고침 후 API 키가 남지 않는다', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    expect(screen.getByLabelText('이 브라우저에 키 저장')).not.toBeChecked();
    await user.type(screen.getByLabelText('API Key'), 'test-key-123');

    reload(unmount);
    expect(screen.getByLabelText('API Key')).toHaveValue('');
  });

  it('키 저장을 끄면 이미 저장된 키를 localStorage에서 지운다', async () => {
    const user = userEvent.setup();
    render(<App />);
    const remember = screen.getByLabelText('이 브라우저에 키 저장');
    await user.click(remember);
    await user.type(screen.getByLabelText('API Key'), 'test-key-123');
    await user.click(remember);

    expect(JSON.stringify({ ...localStorage })).not.toContain('test-key-123');
  });

  it('API 키는 Provider별로 따로 보관되어 Provider를 오가도 지워지지 않는다', async () => {
    const user = userEvent.setup();
    render(<App />);
    const provider = screen.getByLabelText('Provider');
    await user.click(screen.getByLabelText('이 브라우저에 키 저장'));
    await user.type(screen.getByLabelText('API Key'), 'google-key');

    await user.selectOptions(provider, 'anthropic');
    expect(screen.getByLabelText('API Key')).toHaveValue('');
    await user.selectOptions(provider, 'google');
    expect(screen.getByLabelText('API Key')).toHaveValue('google-key');
  });
});

describe('프롬프트 히스토리', () => {
  it('생성한 프롬프트가 최근 프롬프트에 추가되고 새로고침 후에도 유지된다', async () => {
    // 서버(.env)에 Google 키가 있고, 생성 API는 고정 코드를 돌려준다.
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => ({
        ok: true,
        json: async () =>
          url === '/api/config'
            ? { envKeys: { anthropic: false, google: true } }
            : { code: 'render(<div />);' },
      })),
    );
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await screen.findByText('.env 키가 연결되어 있습니다.');
    await user.type(screen.getByRole('textbox'), '로그인 폼');
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));
    await screen.findByText('생성된 컴포넌트');

    reload(unmount);
    const recent = screen.getByRole('group', { name: '최근 프롬프트' });
    expect(within(recent).getByRole('button', { name: '로그인 폼' })).toBeInTheDocument();
  });
});
