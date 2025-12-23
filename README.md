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

### 開発用サーバー

```sh
devenv up -d # run in background, logs at .devenv/processes.log
devenv processes down # kill the background service
```

## 注意点

### Pre-Commit Hook について

コミット前に Lefthook というツールで自動的に型チェックなどを実行し、通らなかったらコミットしないようにしています。

エラーの共有など目的で、気にせずコミットしたい場合は、 `git commit` に `-n` フラグを渡してください。

```sh
git commit -m "It's not working??" -n
```

### 独自命名規則

- Snippet の命名は camelCase で行います。 (PascalCase はコンポーネントと混同されるため)
