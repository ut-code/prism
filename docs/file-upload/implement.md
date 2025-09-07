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

```typescript
generateUploadUrl: mutation({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, { organizationId }) => {
    // 認証・権限チェック
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("認証が必要です");

    await checkOrganizationMember(ctx, organizationId, identity.subject);

    return await ctx.storage.generateUploadUrl();
  },
});
```

#### `saveFileInfo`

アップロード後のファイル情報をデータベースに保存します。

```typescript
saveFileInfo: mutation({
  args: {
    storageId: v.string(),
    filename: v.string(),
    originalFilename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    organizationId: v.id("organizations"),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("認証が必要です");

    // ファイルサイズ制限チェック
    if (args.size > 10 * 1024 * 1024) {
      // 10MB
      throw new Error("ファイルサイズが大きすぎます（最大10MB）");
    }

    return await ctx.db.insert("files", {
      ...args,
      uploadedBy: identity.subject,
      uploadedAt: Date.now(),
    });
  },
});
```

#### `deleteFile`

ファイルを削除します。

```typescript
deleteFile: mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, { fileId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("認証が必要です");

    const file = await ctx.db.get(fileId);
    if (!file) throw new Error("ファイルが見つかりません");

    // 権限チェック（アップロード者またはadmin）
    if (file.uploadedBy !== identity.subject) {
      await checkOrganizationAdmin(ctx, file.organizationId, identity.subject);
    }

    // ストレージからファイルを削除
    await ctx.storage.delete(file.storageId);

    // データベースからレコードを削除
    await ctx.db.delete(fileId);
  },
});
```

### Queries

#### `getFile`

ファイル情報とアクセスURLを取得します。

```typescript
getFile: query({
  args: { fileId: v.id("files") },
  handler: async (ctx, { fileId }) => {
    const file = await ctx.db.get(fileId);
    if (!file) return null;

    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      await checkOrganizationMember(ctx, file.organizationId, identity.subject);
    }

    const url = await ctx.storage.getUrl(file.storageId);
    return { ...file, url };
  },
});
```

#### `listFiles`

Organization内のファイル一覧を取得します。

```typescript
listFiles: query({
  args: {
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { organizationId, limit = 50 }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    await checkOrganizationMember(ctx, organizationId, identity.subject);

    const files = await ctx.db
      .query("files")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId),
      )
      .order("desc")
      .take(limit);

    return Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.storageId),
      })),
    );
  },
});
```

## フロントエンド設計

### コンポーネント構成

#### 1. FileUploader.svelte

メインのファイルアップロードコンポーネント

**Props:**

- `organizationId: string` - アップロード先のOrganization ID
- `onUpload?: (files: FileInfo[]) => void` - アップロード完了時のコールバック

**Features:**

- ドラッグ&ドロップエリア
- ファイル選択ボタン
- 複数ファイル選択
- アップロード進捗表示
- バリデーション（サイズ・形式）

#### 2. FilePreview.svelte

ファイルのプレビュー表示コンポーネント

**Props:**

- `file: File | FileInfo` - プレビューするファイル
- `removable?: boolean` - 削除ボタンの表示制御
- `onRemove?: () => void` - 削除時のコールバック

**Features:**

- 画像プレビュー
- ファイル情報表示（名前・サイズ・形式）
- 削除ボタン

#### 3. FileAttachment.svelte

メッセージ内の添付ファイル表示コンポーネント

**Props:**

- `fileId: string` - ファイルID
- `compact?: boolean` - コンパクト表示モード

**Features:**

- ファイル情報表示
- ダウンロードリンク
- 画像のインラインプレビュー

#### 4. MessageInput.svelte (拡張)

既存のメッセージ入力コンポーネントを拡張

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

### アップロード最適化

- **並行アップロード**: 複数ファイルの並行処理
- **チャンク分割**: 大ファイルの分割アップロード（将来実装）
- **レジューム**: 中断されたアップロードの再開（将来実装）

### 表示最適化

- **遅延読み込み**: 画像の lazy loading
- **サムネイル**: 小さいプレビュー画像生成（将来実装）
- **キャッシュ**: ファイルURLのキャッシュ

## 実装順序

### Phase 1: 基盤整備

- [ ] データベーススキーマ更新
- [ ] 基本的なConvex API実装
- [ ] 権限チェック関数の実装

### Phase 2: ファイルアップロード

- [ ] FileUploader コンポーネント実装
- [ ] ドラッグ&ドロップ機能
- [ ] アップロード進捗表示

### Phase 3: プレビュー・表示

- [ ] FilePreview コンポーネント実装
- [ ] FileAttachment コンポーネント実装
- [ ] 画像プレビュー機能

### Phase 4: メッセージ統合

- [ ] MessageInput コンポーネント拡張
- [ ] 添付ファイル付きメッセージ機能
- [ ] MessageList での添付ファイル表示

### Phase 5: 最適化・テスト

- [ ] エラーハンドリング強化
- [ ] パフォーマンス最適化
- [ ] E2Eテスト実装

## 将来の拡張予定

- **ファイル管理画面**: Organization内のファイル管理機能
- **高度なプレビュー**: PDF, 動画のプレビュー
- **ファイル検索**: ファイル名・メタデータ検索
- **自動削除**: 古いファイルの自動削除機能
- **帯域幅最適化**: 画像圧縮・リサイズ機能
