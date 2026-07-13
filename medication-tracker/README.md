# 복약 대장 (medication-tracker)

Supabase를 데이터베이스로 쓰는 실시간 복약 관리 웹앱입니다.

## GitHub + Vercel로 배포하는 순서

1. github.com에서 새 저장소(repository) 생성 (예: `medication-tracker`)
2. 이 폴더 전체를 그 저장소에 업로드 (GitHub 웹에서 "Add file → Upload files"로 드래그해도 됨)
3. vercel.com 접속 → GitHub 계정으로 로그인 → "Add New → Project"
4. 방금 만든 저장소 선택 → Import
5. Framework Preset: Vite로 자동 인식됨. 그대로 두고 "Deploy" 클릭
6. (선택) Environment Variables에 아래 두 개를 넣으면 더 안전함 — 안 넣어도 기본값으로 작동함
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. 배포 완료되면 `프로젝트이름.vercel.app` 링크가 생김 — 그 링크로 어디서나 접속 가능

## 로컬에서 테스트하려면

```
npm install
npm run dev
```
