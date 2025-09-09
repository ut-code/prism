# ファイルアップロード機能 設計書

## 概要

Prismチャットアプリケーションにおけるファイルアップロード機能の詳細設計書です。

## システム構成

- **フロントエンド**: SvelteKit (Svelte 5 runes mode)
- **バックエンド**: Convex (リアルタイムデータベース & API)
- **ファイルストレージ**: Convex File Storage
- **認証**: Convex Auth

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

### 新しいテーブル: `files`

```typescript
files: defineTable({
  // Convex Storage ID
  storageId: v.string(),
  // ファイル情報
  filename: v.string(),
  originalFilename: v.string(),
  mimeType: v.string(),
  size: v.number(), // bytes
  // メタデータ
  uploadedBy: v.id("users"),
  uploadedAt: v.number(),
  organizationId: v.id("organizations"),
  // 画像の場合の追加情報
  width: v.optional(v.number()),
  height: v.optional(v.number()),
})
  .index("by_organization", ["organizationId"])
  .index("by_uploader", ["uploadedBy"]);
```

### 既存テーブル拡張: `messages`

```typescript
messages: defineTable({
  channelId: v.id("channels"),
  content: v.string(),
  author: v.string(),
  createdAt: v.number(),
  parentId: v.optional(v.id("messages")),
  // 添付ファイル (新規追加)
  attachments: v.optional(v.array(v.id("files"))),
}).index("by_channel", ["channelId"]);
```

## API設計 (Convex)

### Mutations

#### `generateUploadUrl`

アップロード用の署名付きURLを生成します。

#### `saveFileInfo`

アップロード後のファイル情報をデータベースに保存します。

#### `deleteFile`

ファイルを削除します。

### Queries

#### `getFile`

ファイル情報とアクセスURLを取得します。

#### `listFiles`

Organization内のファイル一覧を取得します。

## フロントエンド設計

### コンポーネント構成

#### 1. ファイルアップロードコンポーネント

**Features:**

- ドラッグ&ドロップエリア
- ファイル選択ボタン
- 複数ファイル選択
- アップロード進捗表示
- バリデーション（サイズ・形式）

#### 2. ファイルのプレビュー表示コンポーネント

**Features:**

- 画像プレビュー
- ファイル情報表示（名前・サイズ・形式）
- 削除ボタン

#### 3. メッセージ内の添付ファイル表示コンポーネント

**Features:**

- ファイル情報表示
- ダウンロードリンク
- 画像のインラインプレビュー

#### 4. 既存のメッセージ入力コンポーネントを拡張

**追加Features:**

- ファイル添付ボタン
- 添付ファイル一覧表示
- 添付ファイル付きメッセージ送信

### アップロードフロー

1. **ファイル選択/ドロップ**
   - ファイルバリデーション
   - プレビュー表示

2. **アップロード開始**
   - `generateUploadUrl` を呼び出し
   - Convex Storage へファイルアップロード
   - 進捗表示

3. **メタデータ保存**
   - `saveFileInfo` を呼び出し
   - ファイル情報をデータベースに保存

4. **メッセージ送信** (任意)
   - 添付ファイルIDを含むメッセージを送信

### エラーハンドリング

- **ファイルサイズエラー**: "ファイルサイズが大きすぎます（最大10MB）"
- **形式エラー**: "サポートされていないファイル形式です"
- **ネットワークエラー**: "アップロードに失敗しました。再試行してください"
- **権限エラー**: "ファイルのアップロード権限がありません"

## セキュリティ

### 認証・認可

- **アップロード**: ログインユーザーのみ
- **アクセス**: Organization メンバーのみ
- **削除**: アップロード者またはOrganization admin

### ファイル検証

- **MIMEタイプ**: クライアント・サーバー両方で検証
- **ファイルサイズ**: 10MB制限
- **ファイル名**: サニタイズ処理

### アクセス制御

- **プライベートURL**: 署名付きURL使用
- **権限チェック**: ファイルアクセス時に毎回確認

## パフォーマンス最適化

### 表示最適化

- **遅延読み込み**: 画像の lazy loading
- **サムネイル**: 小さいプレビュー画像生成（将来実装）
- **キャッシュ**: ファイルURLのキャッシュ

## 将来の拡張予定

- **ファイル管理画面**: Organization内のファイル管理機能
- **高度なプレビュー**: PDF, 動画のプレビュー
- **ファイル検索**: ファイル名・メタデータ検索
- **自動削除**: 古いファイルの自動削除機能
- **帯域幅最適化**: 画像圧縮・リサイズ機能
