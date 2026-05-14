# n8n Workflow Builder Agent

n8n workflow JSON을 **생성, 검증, 배포, 백업, 실행 기록 분석**까지 이어서 처리하기 위한 에이전트형 도구 모음입니다.

이 레포는 AI가 n8n workflow를 만들 때 자주 틀리는 부분을 줄이기 위해 만들었습니다.
노드 파라미터를 추측하지 않고, 기존 n8n export에서 실제 node shape를 추출한 뒤 검증 스크립트와 n8n API 스크립트로 `작성 → 검증 → 배포 → 실행 결과 확인 → 수정` 루프를 돕습니다.

## 할 수 있는 일

- 기존 n8n export에서 node parameter shape 추출
- workflow JSON 구조와 connection 참조 검증
- workflow 이름 기준으로 n8n 인스턴스에 create/update 배포
- n8n 서버의 workflow 백업
- execution 목록 조회
- execution 상세 조회와 실패 node 요약
- Claude/Codex-style skill 제공: `skill/`

## 요구사항

- Node.js 18 이상
- n8n Public API key
- 대상 n8n 인스턴스에 필요한 credential이 미리 등록되어 있어야 함

## 환경변수

```bash
export N8N_URL=https://your-instance.n8n.cloud
export N8N_API_KEY=n8n_api_xxxxx
```

실제 API key는 절대 git에 커밋하지 마세요.

## 디렉토리 구조

```text
scripts/
  deploy-workflow.mjs
  backup-workflow.mjs
  list-executions.mjs
  inspect-execution.mjs
  lib/n8n-api.mjs
skill/
  SKILL.md
  scripts/
    extract-node-shapes.mjs
    validate-workflow.mjs
  references/
workflows/
  .gitkeep
backups/
  .gitkeep
```

## 기본 작업 흐름

1. n8n에서 export한 workflow JSON 또는 생성한 workflow JSON을 `workflows/` 아래에 둡니다.

2. 기존 workflow에서 node shape를 추출합니다.

```bash
node skill/scripts/extract-node-shapes.mjs workflows
```

예제 workflow로 먼저 동작을 확인할 수도 있습니다.

```bash
node skill/scripts/validate-workflow.mjs examples/workflows/manual-code-example.json
node scripts/deploy-workflow.mjs examples/workflows/manual-code-example.json --dry-run
```

3. workflow JSON을 검증합니다.

```bash
node skill/scripts/validate-workflow.mjs workflows/my-workflow.json
```

4. 배포 payload를 dry-run으로 확인합니다.

```bash
node scripts/deploy-workflow.mjs workflows/my-workflow.json --dry-run
```

5. 기존 서버 workflow를 백업합니다.

```bash
node scripts/backup-workflow.mjs --name "My Workflow"
```

6. workflow를 배포합니다.

```bash
node scripts/deploy-workflow.mjs workflows/my-workflow.json --keep-creds
```

`--keep-creds`는 **같은 n8n 인스턴스에서 export한 workflow를 다시 같은 인스턴스에 배포할 때** 사용합니다.
이 옵션을 쓰면 기존 credential ID를 유지하므로 배포 후 credential 연결이 끊기지 않습니다.

반대로 reusable template이나 다른 n8n 인스턴스로 옮길 workflow라면 `--keep-creds`를 빼세요. 기본 동작은 credential ID를 제거합니다.

7. 실패한 실행을 확인합니다.

```bash
node scripts/list-executions.mjs --workflow-name "My Workflow" --status error --limit 10
node scripts/inspect-execution.mjs <executionId>
```

## 배포 후 활성화

```bash
node scripts/deploy-workflow.mjs workflows/my-workflow.json --activate
```

`--activate`는 서버에서 workflow를 바로 활성화해야 할 때만 사용하세요.

## 구현 전 체크리스트

AI 에이전트가 workflow JSON을 만들기 전에 먼저 확인해야 하는 항목입니다.

- 필요한 n8n credential 이름
- 필요한 API 권한과 scope
- 필요한 resource ID와 URL
- 테스트 실행에 쓸 sample input
- 배포 대상 n8n 인스턴스
- `--keep-creds`가 필요한 same-instance 배포인지 여부

관련 지침은 `skill/references/preflight-requirements.md`에 들어 있습니다.

## 보안 주의사항

- n8n credential은 대상 n8n 인스턴스에 미리 만들어두세요.
- 배포 스크립트는 기본적으로 node의 credential `id` 필드를 제거합니다. credential ID는 n8n 인스턴스마다 다르기 때문입니다.
- 같은 self-hosted n8n 인스턴스에 재배포할 때는 `--keep-creds`를 사용하세요.
- validator는 credential ID를 경고하고, 흔한 secret/token 패턴을 차단합니다.
- execution data에는 민감한 payload가 들어 있을 수 있습니다. `inspect-execution.mjs --json` 사용 시 주의하세요.

## 알려진 한계

- self-hosted n8n workflow update는 `PUT /api/v1/workflows/:id`를 사용합니다. `PATCH`는 n8n 버전에 따라 안정적이지 않습니다.
- Schedule/Manual trigger workflow는 n8n Public API로 임의 즉시 실행하기 어렵습니다. 테스트하려면 test Webhook trigger나 Execute Workflow wrapper를 두는 편이 좋습니다.
- Slack Block Kit처럼 rich payload가 필요한 경우 native Slack node보다 HTTP Request + Slack Incoming Webhook을 우선 권장합니다.
- Meta Marketing API처럼 기존 export에 없는 API node는 공식 문서와 실제 테스트 호출로 parameter shape를 확인한 뒤 작성해야 합니다.

## 에이전트 구성

이 레포에서 말하는 에이전트는 아래 요소들의 조합입니다.

- `skill/SKILL.md`: workflow 작성 절차와 guardrail
- `skill/scripts/extract-node-shapes.mjs`: 실제 export에서 node syntax 추출
- `skill/scripts/validate-workflow.mjs`: workflow JSON 정적 검증
- `scripts/*.mjs`: n8n API 기반 배포, 백업, execution 분석 도구

완전 자율 서비스라기보다는, AI가 `관찰 → 수정 → 검증 → 배포 → 실행 결과 확인 → 재수정` 루프를 안정적으로 돌 수 있게 해주는 **스크립트 기반 에이전트 도구**입니다.
