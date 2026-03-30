# AGENTS.md

このファイルは、このリポジトリでコードを扱う際のエージェント向けガイダンスを提供します。

## 重要な非自明パターン

### デュアルモードアーキテクチャ
- `OPENWEATHER_API_KEY`が欠落または無効な場合、サーバーは自動的にDEMO_MODEを検出
- `isConnected=false`は`generateMockWeatherData()`でモックデータ生成をトリガー（server.js:91）
- フォールバックなし - API呼び出しは必ず`/api/weather`エンドポイント経由、フロントエンドから直接MCP呼び出しは不可

### MCPサーバーパスのハードコーディング
- MCPサーバーパスはserver.js:24でハードコード: `/Users/liu/Documents/IBM Bob/MCP/weather-server/build/index.js`
- 異なる環境にデプロイする場合はこのパスを更新する必要あり
- パスにスペースが含まれる - spawn()呼び出しで適切なエスケープが必要

### 日本語データキー
- 天気データは日本語キーを使用: `都市`, `気温`, `体感温度`, `天気`, `詳細`, `湿度`, `気圧`, `風速`
- フロントエンドは`formatWeatherData()`でこれらの正確なキーを期待（app.js:89）
- キーを変更するとUIレンダリングが壊れる

### 都市名抽出ロジック
- `extractCityName()`（app.js:53）はハードコードされた都市リスト + 正規表現フォールバックを使用
- 正規表現パターン`/([ぁ-んァ-ヶー一-龠a-zA-Z]+)の/`は「の」の前の単語を抽出
- 新しい都市を追加するにはハードコード配列の更新が必要

### 予報日数の制限
- 日数は`extractDays()`で1-5の範囲にクランプ（app.js:83）
- バックエンドは`generateMockWeatherData()`で8倍（3時間間隔）に乗算（app.js:109）
- 実際のAPIも3時間間隔を使用するため、これは意図的な整合性

### ES Moduleの要件
- `package.json`に`"type": "module"`あり - すべてのファイルでES6インポートを使用
- `__dirname`は`fileURLToPath()`を使用して手動で構築する必要あり（server.js:8-9）
- CommonJSの`require()`はどこでも使用不可

### ポート設定
- ポート3000はserver.js:12でハードコード
- 環境変数のオーバーライドなし - ポートを変更するにはコードを編集する必要あり
- Expressは`__dirname`から静的ファイルを提供（server.js:16）

## ビルド/実行コマンド
```bash
npm start          # 本番モード
npm run dev        # 開発モード（--watchフラグで自動リロード）
```

## MCPサーバーの場所
外部依存関係: `/Users/liu/Documents/IBM Bob/MCP/weather-server/`
- このアプリを実行する前に事前ビルドが必要
- ビルドコマンド: `cd "/Users/liu/Documents/IBM Bob/MCP/weather-server" && npm run build`