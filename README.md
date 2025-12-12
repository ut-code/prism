# Prism

## 開発

Prism では、 Monorepo 構成を採用しており、 `apps/` にそれぞれのプログラムとライブラリが入っています。

### セットアップ

- インストール:
  - Bun >= v1.2
  - Hivemind <https://github.com/DarthSim/hivemind>
  - PostgreSQL
- 実行: `bun install --frozen-lockfile`

### 開発用サーバー

- Server (`bun run:server`)
  - Elysia API server at <http://localhost:3000>
- Web Client (`bun run:web`)
  - depends on Server
  - <http://localhost:5173>
- Storybook (`bun dev:storybook`)
  - <http://localhost:6006>
- Tauri (`bun dev:tauri`)
  - depends on Server
  - conflicts with web client

```sh
bun dev
```

でアプリケーションの動作に必要なものだけ (Server + Web Client) を起動します。

#### Storybook

```sh
bun dev:storybook
```

で上に加え Storybook が起動します。

#### Tauri

Tauri はコンパイルに時間と計算資源を使うので、

```sh
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

### (client) Icon の使用について

- unplugin-icons を使っています。 <https://github.com/unplugin/unplugin-icons>
- Usage Example: `import MdiClose from "~icons/mdi/close"`
- 現在インストールされているアイコンセットは以下のとおりです:
  - mdi (Material Design Icons)
- 新規アイコンセットを追加する場合は、`cd apps/desktop; bun add @iconify-json/[iconset]` で追加できます。
- icon の一覧はここで見れます。: https://icones.js.org/

### 独自命名規則

- Snippet の命名は camelCase で行います。 (PascalCase はコンポーネントと混同されるため)
