# 天気予報チャットボット - 初期化ガイド

このプロジェクトは、MCPサーバーを使用した天気予報チャットボットです。

## プロジェクト概要

**機能:**
- 🌍 世界中の都市の現在の天気情報を取得
- 📅 最大5日間の天気予報を取得
- 💬 自然言語でのやりとり
- 🎨 美しいUIデザイン
- 🎭 デモモード（APIキーなしで動作確認可能）
- ⚡ ライブモード（APIキー設定時に実際の天気データ）

## 技術スタック

- **フロントエンド**: HTML, CSS, JavaScript
- **バックエンド**: Node.js, Express.js
- **MCP**: Model Context Protocol SDK
- **API**: OpenWeather API（オプション）

## ファイル構成

```
weather_report/
├── index.html          # チャットUIインターフェース
├── app.js             # フロントエンドロジック
├── server.js          # Express.jsバックエンド
├── package.json       # プロジェクト設定
├── .gitignore         # Git除外設定
└── README.md          # ドキュメント

/Users/liu/Documents/IBM Bob/MCP/weather-server/
├── src/
│   └── index.ts       # MCPサーバー実装
├── build/
│   └── index.js       # コンパイル済みサーバー
├── package.json
└── tsconfig.json
```

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. MCPサーバーの確認

MCPサーバーは既にビルド済みです：
```bash
ls -la "/Users/liu/Documents/IBM Bob/MCP/weather-server/build/index.js"
```

### 3. サーバーの起動

**デモモード（APIキー不要）:**
```bash
npm start
```

サーバーは http://localhost:3000 で起動します。

**ライブモード（実際の天気データ）:**

OpenWeather APIキーを取得後：
```bash
export OPENWEATHER_API_KEY="your-api-key-here"
npm start
```

または、MCP設定ファイルを更新：
```bash
# /Users/liu/.bob/settings/mcp_settings.json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/Users/liu/Documents/IBM Bob/MCP/weather-server/build/index.js"],
      "env": {
        "OPENWEATHER_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 4. ブラウザでアクセス

http://localhost:3000 を開いて、以下のようなメッセージを試してください：

- 「東京の天気を教えて」
- 「大阪の3日間の予報は？」
- 「札幌の天気は？」
- 「福岡の5日間の予報を見せて」

## OpenWeather APIキーの取得（オプション）

デモモードで十分な場合はスキップできます。

1. https://openweathermap.org/ にアクセス
2. アカウントを作成（無料プランで十分）
3. ログイン後、「API keys」タブでAPIキーを取得
4. 上記の手順3に従ってAPIキーを設定

## トラブルシューティング

### ポート3000が既に使用されている

```bash
# 別のポートで起動
PORT=3001 npm start
```

### MCPサーバーに接続できない

デモモードで動作しているか確認：
```bash
# サーバーログに "⚠️ Running in DEMO MODE" が表示されるはず
npm start
```

### 依存関係のエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

## 開発

### サーバーの再起動

コードを変更した場合：
```bash
# Ctrl+C でサーバーを停止
npm start
```

### MCPサーバーの再ビルド

MCPサーバーのコードを変更した場合：
```bash
cd "/Users/liu/Documents/IBM Bob/MCP/weather-server"
npm run build
```

## GitHubリポジトリ

https://github.com/tutu-liu/weather-chatbot

## ライセンス

MIT

---

**注意**: このプロジェクトはデモモードで完全に動作します。実際の天気データが必要な場合のみ、OpenWeather APIキーを設定してください。