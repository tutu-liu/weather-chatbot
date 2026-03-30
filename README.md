# 天気予報チャットボット 🌤️

MCPサーバーを使用した天気予報チャットボットアプリケーションです。

## 機能

- 🌍 世界中の都市の現在の天気情報を取得
- 📅 最大5日間の天気予報を取得
- 💬 自然言語でのやりとり
- 🎨 美しいUIデザイン
- ⚡ リアルタイムの天気データ（APIキー設定時）
- 🎭 デモモード（APIキーなしでも動作確認可能）

## 構成

このプロジェクトは以下のコンポーネントで構成されています：

1. **MCPサーバー** (`/Users/liu/Documents/IBM Bob/MCP/weather-server/`)
   - OpenWeather APIと連携
   - 天気情報を取得するツールを提供

2. **Webサーバー** (`server.js`)
   - Express.jsベースのバックエンド
   - MCPクライアントとして動作
   - REST APIエンドポイントを提供

3. **フロントエンド** (`index.html`, `app.js`)
   - チャットインターフェース
   - 天気データの視覚化

## セットアップ

### 1. 依存関係のインストール

```bash
# プロジェクトルートで
npm install

# MCPサーバーのビルド（既に完了している場合はスキップ）
cd "/Users/liu/Documents/IBM Bob/MCP/weather-server"
npm install
npm run build
```

## 使用方法

### クイックスタート（デモモード）

APIキーなしですぐに試せます：

```bash
npm start
```

サーバーは `http://localhost:3000` で起動します。デモモードではランダムな天気データが表示されます。

### 実際の天気データを使用する場合

#### 1. OpenWeather APIキーの取得

1. [OpenWeatherMap](https://openweathermap.org/)にアクセス
2. アカウントを作成（無料プランで十分です）
3. ログイン後、「API keys」タブでAPIキーを取得

**注意**: OpenWeatherMapのサインアップでエラーが発生する場合は、しばらく時間をおいてから再度お試しください。または、デモモードでアプリケーションの機能を確認できます。

#### 2. 環境変数の設定

MCPサーバーの設定ファイルを更新します：

```bash
# /Users/liu/.bob/settings/mcp_settings.json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/Users/liu/Documents/IBM Bob/MCP/weather-server/build/index.js"],
      "env": {
        "OPENWEATHER_API_KEY": "ここに実際のAPIキーを入力"
      }
    }
  }
}
```

または、環境変数として設定：

```bash
export OPENWEATHER_API_KEY="your-api-key-here"
npm start
```

#### 3. サーバーを再起動

設定後、サーバーを再起動すると実際の天気データが取得されます。

### チャットボットの使用

ブラウザで `http://localhost:3000` を開き、以下のようなメッセージを入力してください：

- 「東京の天気を教えて」
- 「大阪の3日間の予報は？」
- 「札幌の天気は？」
- 「福岡の5日間の予報を見せて」

## 利用可能なMCPツール

### get_current_weather
指定された都市の現在の天気情報を取得します。

**パラメータ:**
- `city` (string): 都市名（例：Tokyo, Osaka, New York）

**返り値:**
- 気温、体感温度、湿度、気圧、風速、天気の説明など

### get_forecast
指定された都市の天気予報を取得します。

**パラメータ:**
- `city` (string): 都市名
- `days` (number, optional): 予報日数（1-5日、デフォルト: 3日）

**返り値:**
- 3時間ごとの予報データ（気温、天気、湿度、風速など）

## プロジェクト構造

```
weather_report/
├── index.html          # フロントエンドUI
├── app.js             # フロントエンドロジック
├── server.js          # バックエンドサーバー
├── package.json       # プロジェクト設定
└── README.md          # このファイル

/Users/liu/Documents/IBM Bob/MCP/weather-server/
├── src/
│   └── index.ts       # MCPサーバー実装
├── build/
│   └── index.js       # コンパイル済みサーバー
├── package.json
└── tsconfig.json
```

## 動作モード

### デモモード 🎭
- APIキーが設定されていない場合に自動的に有効化
- ランダムな天気データを生成して表示
- アプリケーションの機能とUIを確認できます
- サーバー起動時に「⚠️ Running in DEMO MODE」と表示されます

### ライブモード ⚡
- OpenWeather APIキーが設定されている場合に有効化
- 実際の天気データをリアルタイムで取得
- サーバー起動時に「✅ MCP client connected successfully」と表示されます

## トラブルシューティング

### OpenWeatherMapのサインアップでエラーが発生する

OpenWeatherMapのサーバーが一時的に利用できない場合があります。以下の対処法をお試しください：

1. **デモモードで使用**: APIキーなしでもアプリケーションの全機能を試せます
2. **時間をおいて再試行**: しばらく待ってから再度サインアップを試してください
3. **別のブラウザを使用**: 異なるブラウザでサインアップを試してください

### MCPサーバーに接続できない

1. MCPサーバーが正しくビルドされているか確認：
   ```bash
   cd "/Users/liu/Documents/IBM Bob/MCP/weather-server"
   npm run build
   ```

2. APIキーが正しく設定されているか確認

3. サーバーログを確認：
   ```bash
   npm start
   ```

### 天気情報が取得できない

1. デモモードで動作しているか確認（サーバーログを確認）
2. ライブモードの場合：
   - OpenWeather APIキーが有効か確認
   - インターネット接続を確認
   - 都市名のスペルを確認（英語名または日本語名）

## 技術スタック

- **フロントエンド**: HTML, CSS, JavaScript
- **バックエンド**: Node.js, Express.js
- **MCP**: Model Context Protocol SDK
- **API**: OpenWeather API

## ライセンス

MIT

## 作者

Created with ❤️ using MCP