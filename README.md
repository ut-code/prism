# Prism

## 開発

Prism では、 Monorepo 構成を採用しており、 `packages/` にそれぞれのプログラムとライブラリが入っています。

### セットアップ

- インストール:
  - Bun >= v1.2
  - Hivemind <https://github.com/DarthSim/hivemind>
- 実行: `bun install --frozen-lockfile`

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

たまに Convex が Interactive でないと落ちるので、その場合は

```sh
bun dev:web
bun dev:convex
```

と別々で起動しましょう。

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
