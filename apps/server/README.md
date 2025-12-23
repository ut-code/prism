# Prism Elysia Server

Elysia と Drizzle ORM を使用した Prism のバックエンドサーバーです。

## セットアップ

### 1. 環境変数の設定

`.env.example` を `.env` にコピーして、適切な値を設定してください。

```bash
cp .env.example .env
```

### 2. データベースの準備

PostgreSQL データベースを起動し、マイグレーションを実行します。

```bash
# マイグレーションファイルの生成
bun run drizzle-kit generate

# マイグレーションの実行
bun run drizzle-kit migrate
```

### 3. サーバーの起動

```bash
bun run dev
```

サーバーは http://localhost:3000 で起動します。

## API エンドポイント

### 認証 (Auth)

- `GET /auth/me` - 現在のユーザー情報を取得
- `POST /auth/signin` - サインイン
- `POST /auth/signout` - サインアウト

### Organizations

- `GET /organizations` - 組織一覧を取得
- `POST /organizations` - 組織を作成
- `GET /organizations/:id` - 組織詳細を取得
- `PATCH /organizations/:id` - 組織を更新
- `GET /organizations/:id/members` - メンバー一覧を取得
- `POST /organizations/:id/members` - メンバーを追加
- `DELETE /organizations/:id/members/:userId` - メンバーを削除

### Channels

- `GET /channels?organizationId=xxx` - チャンネル一覧を取得
- `POST /channels` - チャンネルを作成
- `GET /channels/:id` - チャンネル詳細を取得

### Messages

- `GET /messages?channelId=xxx` - メッセージ一覧を取得
- `POST /messages` - メッセージを送信
- `GET /messages/:id/reactions` - リアクション一覧を取得
- `POST /messages/:id/reactions` - リアクションを追加
- `DELETE /messages/:id/reactions/:emoji` - リアクションを削除

### Users

- `GET /users/me` - 現在のユーザー情報を取得
- `POST /users/names` - ユーザー名の一括取得
- `POST /users/nicknames` - ニックネームの一括取得
- `GET /users/search?email=xxx` - メールアドレスでユーザーを検索

### Files

- `GET /files?organizationId=xxx` - ファイル一覧を取得
- `POST /files` - ファイルを登録
- `GET /files/:id` - ファイル詳細を取得
- `DELETE /files/:id` - ファイルを削除

### Tasks

- `GET /tasks` - タスク一覧を取得
- `POST /tasks` - タスクを作成
- `PATCH /tasks/:id` - タスクを更新

### Votes

- `GET /votes/:id` - 投票詳細を取得
- `POST /votes` - 投票を作成
- `POST /votes/:id/cast` - 投票する

## アーキテクチャ

### ディレクトリ構造

```
src/
├── db/                    # データベース設定とスキーマ
│   ├── index.ts          # Drizzle インスタンス
│   └── schema.ts         # テーブル定義
├── domains/              # ドメインごとのビジネスロジック
│   ├── auth/
│   ├── organizations/
│   ├── channels/
│   ├── messages/
│   ├── users/
│   ├── files/
│   ├── tasks/
│   └── votes/
├── middleware/           # ミドルウェア
│   └── auth.ts          # 認証ミドルウェア
└── index.ts             # エントリーポイント
```

### 技術スタック

- **Elysia**: 高速な TypeScript フレームワーク
- **Drizzle ORM**: 型安全な ORM
- **PostgreSQL**: データベース
- **JWT**: 認証トークン
