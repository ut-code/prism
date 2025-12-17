# Prism

## 開発

Prism では、 Monorepo 構成を採用しており、 `apps/` にそれぞれのプログラムとライブラリが入っています。

### セットアップ

devenv を使用してください。

### 環境変数

`.env.sample` を `.env` にコピーし、値を設定してください。

```sh
cp .env.sample .env
```

`JWT_SECRET` の生成 (32バイト = 256ビット推奨):

```sh
openssl rand -base64 32
```

### 開発用サーバー

```sh
devenv up
```

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
