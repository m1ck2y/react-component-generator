---
name: create-pr
description: 현재 브랜치의 커밋을 분석해 GitHub Pull Request를 Draft로 생성한다. 프로젝트 성격(해외 오픈소스 / 한국 프로젝트)을 판단해 영문 또는 한국어 PR 템플릿을 골라 제목과 본문을 작성하고, 브랜치를 push한 뒤 gh로 PR을 연다. "PR 만들어줘", "PR 올려줘", "풀리퀘 생성", "create a PR", "open a pull request", "리뷰 요청 올려줘", "이 브랜치 PR로" 같은 요청이면 반드시 이 스킬을 사용한다. 기존 PR의 리뷰 코멘트 처리, PR 리뷰, 커밋만 하는 요청에는 사용하지 않는다.
context: fork
agent: general-purpose
argument-hint: "[--base <branch>] [--lang en|ko] [--dry-run] [추가 요청]"
---

# create-pr

현재 작업 브랜치로 GitHub PR을 만든다. 너는 메인 대화와 분리된 서브에이전트로 실행되므로 **이전 대화 내용을 모르고, 사용자에게 질문할 수도 없다.** 필요한 정보는 모두 git·gh·저장소 파일에서 직접 얻고, 판단이 막히는 상황에서는 추측으로 진행하지 말고 중단한 뒤 이유를 보고한다. 결과 보고가 메인 대화로 전달되는 유일한 출력이다.

호출 인자: `$ARGUMENTS`

- `--base <branch>`: PR 대상 브랜치. 없으면 기본 브랜치.
- `--lang en|ko`: 템플릿 언어를 강제. 없으면 5단계 규칙으로 판단. "영문으로", "한국어로" 같은 자연어도 같은 뜻으로 본다.
- `--dry-run`: push와 PR 생성을 하지 않고, 실행했을 명령과 PR 제목·본문만 보고한다.
- 그 밖의 문장은 PR 본문에 반영할 추가 요청으로 취급한다(예: "이슈 #12 연결해줘").

## 1. 사전 점검 — 하나라도 걸리면 중단

```bash
git status --porcelain
git remote -v
gh auth status
```

- **커밋하지 않은 변경(수정·스테이징·추적 안 된 파일)이 있으면 중단한다.** PR에 무엇이 들어갈지 사용자가 정해야 하는 문제라서, 대신 커밋하지 않는다. 보고에 파일 목록을 적고 "먼저 커밋해 주세요"라고 안내한다.
- 원격(`origin`)이 없으면 중단한다.
- `gh` 로그인이 안 되어 있으면 중단한다. 단 `--dry-run`이면 경고만 남기고 계속한다.

## 2. base·head 브랜치 결정

- base: 인자 `--base` → `gh repo view --json defaultBranchRef -q .defaultBranchRef.name` → `git symbolic-ref --short refs/remotes/origin/HEAD`(앞의 `origin/` 제거) 순으로 결정한다.
- `git fetch origin <base>`로 최신화한 뒤 `git log --oneline origin/<base>..HEAD`로 PR에 들어갈 커밋을 확인한다. **커밋이 없으면 중단한다.**
- 현재 브랜치가 base와 같으면(예: main에서 바로 작업) 커밋 내용으로 새 브랜치를 만든다: `git switch -c <type>/<짧은-영문-slug>` (예: `feat/prompt-length-limit`). 로컬 base 브랜치를 reset하지는 않는다. 되돌리기 어려운 조작이라 사용자 몫으로 남기고, 보고에 "로컬 `<base>`가 원격보다 앞서 있음"을 적는다.
- 같은 head 브랜치로 열린 PR이 이미 있으면(`gh pr view --json url,state`) 새로 만들지 않고 그 URL을 보고한다.

**포크 기여 판별**: `upstream` 원격이 있고 `origin`과 저장소가 다르면, 해외·외부 오픈소스에 포크로 기여하는 상황으로 본다. 이 경우 PR은 upstream 저장소로 연다(`--repo <upstream-owner>/<repo> --head <origin-owner>:<branch>`), base도 upstream 기준으로 정한다.

## 3. 변경 분석

```bash
git log --format='%h %s%n%b' origin/<base>..HEAD
git diff --stat origin/<base>...HEAD
git diff origin/<base>...HEAD
```

- 커밋 메시지만 믿지 말고 diff를 읽어 실제로 바뀐 동작을 파악한다. lock 파일·생성물은 성격만 파악한다.
- **diff에 API 키·토큰·비밀번호·개인키로 보이는 값이 있으면 중단한다.** push하면 원격에 남기 때문이다. 보고에는 파일명과 행 위치만 적고 값은 쓰지 않는다.
- 프로젝트 테스트 명령이 명확하면(예: `package.json`의 `test` 스크립트, `Makefile`의 `test`) 실행해서 결과를 본문 "테스트" 항목에 적는다. 실패해도 Draft이므로 PR은 만들되, 본문과 보고에 실패를 분명히 적는다. 실행 방법이 불분명하면 실행하지 않고 "로컬 테스트 미실행"으로 적는다.

## 4. 저장소 자체 PR 템플릿 확인

다음 위치에 템플릿이 있으면 **그 템플릿을 우선 사용**한다. 프로젝트 관리자가 정한 형식이 우리 기본 템플릿보다 우선하기 때문이다.

- `.github/pull_request_template.md`, `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/PULL_REQUEST_TEMPLATE/*.md`, `docs/pull_request_template.md`, 루트의 `pull_request_template.md`

저장소 템플릿을 쓸 때도 언어는 그 템플릿의 언어를 따르고, 체크리스트 항목은 실제로 확인한 것만 체크한다.

## 5. 언어 결정 (저장소 템플릿이 없을 때)

우선순위대로 판단하고, 앞 단계에서 결정되면 멈춘다.

1. **인자로 지정**된 언어 (`--lang`, "영문으로" 등)
2. **포크 기여**(2단계의 upstream 판별) → 영문
3. **신호 비교**: 아래 신호들의 주 언어를 본다.
   - `README*`의 본문 언어
   - 최근 커밋 메시지 20개의 언어 (`git log -20 --format=%s origin/<base>`)
   - 최근 머지된 PR 제목 (`gh pr list --state merged --limit 10 --json title`, 실패하면 생략)
   - `CONTRIBUTING*`의 언어
   - 원격 저장소 owner가 해외 오픈소스 조직인지 (예: 많은 외부 기여자가 있는 공개 프로젝트)
4. 한국어 신호가 다수면 **한국어**, 그 외에는 **영문**. 신호가 엇갈리면 README와 기존 PR 제목에 가중치를 둔다. 리뷰어가 읽는 언어에 맞추는 것이 목적이다.

템플릿 파일:
- 영문: `${CLAUDE_SKILL_DIR}/references/pr-template-en.md`
- 한국어: `${CLAUDE_SKILL_DIR}/references/pr-template-ko.md`

선택한 템플릿 파일을 읽고 그 안의 작성 가이드를 따른다.

## 6. PR 제목·본문 작성

- **제목**: 저장소의 기존 커밋·PR 제목 컨벤션을 따른다. 컨벤션이 보이지 않으면 `<type>: <요약>` (type은 feat/fix/refactor/chore/docs/test 중 하나). 커밋이 하나면 그 커밋 제목을 기본으로 쓰되 선택한 언어에 맞춘다. 70자 안팎.
- **본문**: 템플릿 섹션 순서를 지키고, 해당 없는 섹션은 템플릿 가이드대로 처리한다. 추측으로 채우지 않는다. diff와 테스트 결과로 확인한 사실만 쓴다.
- 인자의 추가 요청(이슈 연결 등)을 반영한다.
- 본문은 임시 파일에 저장해 `--body-file`로 넘긴다. 셸 따옴표·줄바꿈 문제를 피하기 위해서다.

## 7. push와 PR 생성

`--dry-run`이면 이 단계의 명령을 실행하지 않고 보고에 그대로 적는다.

```bash
git push -u origin <head-branch>
gh pr create --draft --base <base> --head <head-branch> --title "<제목>" --body-file <본문 파일>
# 포크 기여면: gh pr create --draft --repo <upstream-owner>/<repo> --base <base> --head <origin-owner>:<head-branch> ...
```

- 항상 **Draft**로 만든다. 사람이 확인한 뒤 Ready로 바꾸는 것이 이 팀의 방식이다.
- `--force` push는 하지 않는다. push가 거절되면(원격이 앞서 있음 등) 중단하고 상황을 보고한다.
- 리뷰어·라벨·담당자는 인자로 명시된 경우에만 지정한다.

## 8. 결과 보고

메인 대화로 돌아가는 유일한 출력이므로, 사용자가 이것만 읽고 상황을 알 수 있게 쓴다. 보고는 한국어로 쓴다.

```
PR 생성 완료 (Draft)  ← dry-run이면 "PR 미리보기 (dry-run)", 중단이면 "PR 생성 중단"
- URL: https://github.com/<owner>/<repo>/pull/<n>
- 브랜치: <head> → <base> (커밋 N개)
- 템플릿: 한국어 | 영문 | 저장소 템플릿(<경로>) — 판단 근거: <한 줄>
- 테스트: <명령> 통과 | 실패(<요약>) | 미실행
- 참고: <새 브랜치 생성, 로컬 base가 앞서 있음 등 사용자가 알아야 할 것>

제목: <PR 제목>
본문:
<PR 본문 전체>
```

중단한 경우에는 무엇 때문에 멈췄는지와 사용자가 다음에 할 일을 적는다.
