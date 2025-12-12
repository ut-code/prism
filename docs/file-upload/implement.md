# ファイルアップロード機能 設計書

## 概要

Prismチャットアプリケーションにおけるファイルアップロード機能の詳細設計書です。

## システム構成

- **フロントエンド**: SvelteKit (Svelte 5 runes mode)
- **バックエンド**: Elysia (Bun) + Drizzle ORM
- **ファイルストレージ**: Local / S3 compatible
- **認証**: JWT (Cookie-based)

## 機能要件

### 基本機能

- ✅ チャット内でのファイル添付・アップロード
- ✅ ドラッグ&ドロップによるファイルアップロード
- ✅ 複数ファイルの同時アップロード
- ✅ アップロード進捗表示
- ✅ ファイルプレビュー（画像）
- ✅ ファイルダウンロード

### 対応ファイル形式

- **画像**: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`
- **文書**: `.pdf`, `.txt`, `.doc`, `.docx`
- **その他**: 一般的なファイル形式

### 制限事項

- **ファイルサイズ**: 最大 10MB
- **同時アップロード**: 最大 5ファイル
- **権限**: Organization/Channel メンバーのみ

## データベース設計

### テーブル: `files`

```typescript
files: {
  id: uuid primary key,
  // ファイル情報
  filename: string,
  originalFilename: string,
  mimeType: string,
  size: number, // bytes
  path: string, // storage path
  // メタデータ
  uploadedBy: uuid references users(id),
  uploadedAt: timestamp,
  organizationId: uuid references organizations(id),
  // 画像の場合の追加情報
  width: number | null,
  height: number | null,
}
```

### テーブル拡張: `messages`

```typescript
messages: {
  // ... existing fields
  attachments: uuid[] | null, // references files(id)
}
```

## API設計 (Elysia)

### Endpoints

#### `POST /files/upload`

アップロード用エンドポイント。multipart/form-data でファイルを受け取る。

#### `GET /files/:id`

ファイル情報とダウンロードURLを取得。

#### `DELETE /files/:id`

ファイルを削除。

#### `GET /files`

Organization内のファイル一覧を取得。

## セキュリティ

### 認証・認可

- **アップロード**: ログインユーザーのみ
- **アクセス**: Organization メンバーのみ
- **削除**: アップロード者またはOrganization admin

### ファイル検証

- **MIMEタイプ**: クライアント・サーバー両方で検証
- **ファイルサイズ**: 10MB制限
- **ファイル名**: サニタイズ処理

## 将来の拡張予定

- **ファイル管理画面**: Organization内のファイル管理機能
- **高度なプレビュー**: PDF, 動画のプレビュー
- **ファイル検索**: ファイル名・メタデータ検索
- **自動削除**: 古いファイルの自動削除機能
- **帯域幅最適化**: 画像圧縮・リサイズ機能
