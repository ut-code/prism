# TODO: MVP Shortest Path

- Routes
  - ChatApp 「組織設定」リンクを `/orgs/{id}` へ統一
  - 組織作成後のリダイレクトも `/orgs/{id}` へ
- Env
  - `.env.sample`: `PUBLIC_CONVEX_URL`, `SITE_URL` のみに簡素化
  - Google/Resend 認証はポストMVP（任意）と明記
- UI cleanup
  - `ChannelList.svelte` のコンフリクト痕跡コメントを削除
- Docs
  - README に「MVPクイックスタート」（セットアップ/起動/ログイン）を追加
  - 現在の範囲: テキスト/返信/リアクション/添付 は有効
- Sanity check
  - `bun dev:convex` → `bun dev:web` の起動確認
  - フロー: サインイン → 組織作成/選択 → チャンネル作成 → 投稿
