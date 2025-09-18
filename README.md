# Prism

## 開発

Prism では、 Monorepo 構成を採用しており、 `packages/` にそれぞれのプログラムとライブラリが入っています。

### セットアップ

- インストール: Bun >= v1.2
- 実行: `bun install --frozen-lockfile`
- 「開発用サーバー」の方法で Convex 起動後、Convex Dashboard で環境変数設定

### 開発用サーバー

- Convex (`bun dev:convex`)
  - Convex at <http://localhost:3210>
  - Convex Dashboard at <http://localhost:6790>
- Web Client (`bun dev:web`)
  - depends on Convex
  - <http://localhost:5173>
- Storybook (`bun dev:storybook`)
  - <http://localhost:6006>
- Tauri (`bun dev:tauri`)
  - depends on Convex
  - conflicts with web client

```sh
bun dev
```

でアプリケーションの動作に必要なものだけ (Convex + Web Client) を起動します。

(Convex が頻繁に Interactive 性を要求するので、 `bun dev:web` と `bun dev:convex` で別々に起動したほうが安定して起動できるかもしれません)

```sh
bun dev:all
```

で上に加え Storybook が起動します。

#### Tauri

Tauri はコンパイルに時間と計算資源を使うので、

```sh
bun dev:convex # Tauri の動作にバックエンドが必要
bun dev:tauri
```

で明示的に起動しないと起動しません。

Linux で Google ログインなど HTTPS アクセス時に「TLS support is not available」と表示される場合は、WebKitGTK の TLS 実装が不足しています。Nix 開発シェルでは `glib-networking` と `cacert` を追加済みです。Nix を使わない環境では、各ディストリの `glib-networking` と `ca-certificates` をインストールしてください。

##### 認証 (Convex + Google) の設定メモ

- Convex の OAuth コールバック URL は Convex の HTTP エンドポイントに向けます。
  - ローカル開発: `http://localhost:3210/api/auth/callback/google`
  - Google Cloud Console の「承認済みのリダイレクトURI」に上記を追加してください。
- `.env` では以下を揃えてください（ホスト表記は `localhost` に統一推奨）:

```
PUBLIC_CONVEX_URL=http://localhost:3210
CONVEX_SITE_URL=http://localhost:3210
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

- Convex Dashboard 側の環境変数にも `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` / `CONVEX_SITE_URL` を設定してください。
- これがずれていると、Google のトークン交換で `redirect_uri_mismatch` となり認証に失敗します。

## 注意点

### Pre-Commit Hook について

コミット前に Lefthook というツールで自動的に型チェックなどを実行し、通らなかったらコミットしないようにしています。

エラーの共有など目的で、気にせずコミットしたい場合は、 `git commit` に `-n` フラグを渡してください。

```sh
git commit -m "It's not working??" -n
```

### convex-svelte の `useQuery` について

`useQuery` に渡す引数は、関数の形式で渡してください。そうでないと、期待しない動作を引き起こす可能性があります。

```svelte
<script lang="ts">
  // good
  const selectedChannel = useQuery(api.channels.get, () => ({
    id: selectedChannelId,
  }));

  // bad - この形だと `selectedChannelId` の変更を検知できない
  const selectedChannel = useQuery(api.channels.get, { id: selectedChannelId });
</script>
```

### (client) Icon の使用について

- unplugin-icons を使っています。 <https://github.com/unplugin/unplugin-icons>
- Usage Example: `import MdiClose from "~icons/mdi/close"`
- 現在インストールされているアイコンセットは以下のとおりです:
  - mdi (Material Design Icons)
- 新規アイコンセットを追加する場合は、`cd packages/client; bun add @iconify-json/[iconset]` で追加できます。
- icon の一覧はここで見れます。: https://icones.js.org/

### 独自命名規則

- Snippet の命名は camelCase で行います。 (PascalCase はコンポーネントと混同されるため)
