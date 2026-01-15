# Code Review: Channel Groups Feature

## 概要

チャンネルをグループ化する機能の追加。サーバー側でDB スキーマ・API を追加し、フロントエンドでグループ表示・作成UIを実装。

## 良い点

- **構造が整理されている**: サーバー側は `db/`, `domains/` の分離、フロントエンドは `.svelte.ts` への状態管理の切り出しが適切
- **再帰的な階層構造**: ネストしたグループをサポートする設計
- **UXへの配慮**: 折りたたみ状態を localStorage で永続化
- **権限チェック**: 既存の `canCreateChannels` 権限を再利用

---

## 問題点

### Critical

#### 1. 子グループのフィルタリングロジックが間違っている

`ChannelGroup.svelte:96`

```svelte
childGroups={childGroups.filter((g) => g.parentGroupId === child.id)}
```

`childGroups` は既に「現在のグループの直接の子」のみを含んでいるため、その中から `child.id` を親に持つグループを探しても見つからない。

**修正案**: 全グループリストを渡してフィルタリングするか、`organized.groups` を使う

```svelte
childGroups={organized.groups.filter((g) => g.parentGroupId === child.id)}
```

ただし、これだと `organized` を prop で渡す必要があるため、`allGroups` プロパティを追加する設計が望ましい。

---

### High

#### 2. `parentGroupId` のクロス組織バリデーションがない

`routes.ts` (POST, PATCH) で `parentGroupId` が指定された場合、その親グループが同じ organization に属するかの検証がない。

```ts
// routes.ts:68
return createChannelGroup(db, body);
// parentGroupId が別組織のグループでもエラーにならない
```

**修正案**: 作成/更新前に `parentGroupId` の organization をチェック

```ts
if (body.parentGroupId) {
  const parent = await getChannelGroupById(db, body.parentGroupId);
  if (!parent || parent.organizationId !== body.organizationId) {
    throw new BadRequestError("Invalid parent group", "INVALID_PARENT_GROUP");
  }
}
```

#### 3. グループ削除時の子グループ・チャンネルの扱いが不明確

`channelGroups.ts` のスキーマで `parentGroupId` に `onDelete` が設定されていない。

- 子グループはどうなる？（孤児になる？cascade？）
- 所属チャンネルは `onDelete: "set null"` で ungrouped になる

**確認必要**: 意図した動作かどうか。子グループが孤児になるのは問題。

---

### Medium

#### 4. 型キャストによる型安全性の低下

`channelGroups.svelte.ts:84-85`

```ts
const groupId =
  (channel as Channel & { groupId?: string | null }).groupId ?? null;
```

`Channel` 型に `groupId` が含まれていないため型キャストしている。api-client の型定義を更新すべき。

#### 5. リアクティビティのための Set 再作成にコメントがない

`channelGroups.svelte.ts:57`

```ts
collapsedGroups = new Set(collapsedGroups);
```

Svelte 5 のリアクティビティのための再代入だが、初見では意図が分かりにくい。コメント追加を推奨。

#### 6. `ChannelList.svelte` のファイル長

変更後 196 行になっており、CLAUDE.md の「30-50行推奨、100行超で警告」に抵触。グループ関連のロジックを分離することを検討。

---

### Low

#### 7. `query` パラメータの型定義

`routes.ts:37` の GET エンドポイントで `query` のスキーマ定義がない（他のルートにはある）。Elysia の validation を追加すべき。

```ts
{
  query: t.Object({
    organizationId: t.String(),
  }),
}
```

#### 8. インデント計算の CSS

`ChannelGroup.svelte:71`

```svelte
style:padding-left={`calc(${indent} + 0.5rem)`}
```

JS で計算してから渡す方がシンプル。あるいは Tailwind のクラスで対応。

---

## 総評

基本的な実装は整っているが、**子グループのフィルタリングバグ**と**クロス組織のセキュリティ問題**は修正必須。型安全性とファイル長は改善推奨。

| 項目         | 評価               |
| ------------ | ------------------ |
| 機能性       | ⚠️ バグあり        |
| セキュリティ | ⚠️ 要修正          |
| コード品質   | ○ 概ね良好         |
| 保守性       | △ ファイル長に注意 |
