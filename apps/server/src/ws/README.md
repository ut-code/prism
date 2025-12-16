# WebSocket Real-time Infrastructure

Elysia WebSocketを使用したリアルタイム通信基盤。

## 構成

- `/ws/types.ts` - WebSocketイベントと接続の型定義
- `/ws/manager.ts` - 接続とチャンネル購読の管理
- `/ws/index.ts` - WebSocketルートハンドラ
- `/ws/__tests__/ws.test.ts` - テスト

## 使い方

### バックエンド: イベントのブロードキャスト

```ts
import { wsManager } from "./ws/manager.ts";

// チャンネルにメッセージ作成イベントをブロードキャスト
wsManager.broadcast(channelId, {
  type: "message:created",
  channelId,
  message: newMessage,
});
```

### フロントエンド: WebSocket接続

```ts
import { setupWebSocket, getWebSocket } from "@/lib/websocket.svelte.ts";

// 初期化
const ws = setupWebSocket("ws://localhost:3000/ws");
ws.connect();

// チャンネル購読
ws.subscribe(channelId);

// イベントリスナー
ws.on("message:created", (event) => {
  console.log("新しいメッセージ:", event.message);
});

// チャンネル購読解除
ws.unsubscribe(channelId);
```

## イベント種類

- `message:created` - メッセージ作成
- `message:updated` - メッセージ更新
- `message:deleted` - メッセージ削除
- `reaction:added` - リアクション追加
- `reaction:removed` - リアクション削除

## 認証

WebSocket接続は既存のJWT認証を使用。未認証の接続は自動的にクローズされます。
