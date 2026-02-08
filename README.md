# POSアプリ

ブラウザベースのPOS（ポイントオセール）アプリケーション。

## 機能

- 商品登録・選択
- カート管理（数量変更、削除）
- 会計処理（合計計算、お釣り計算）
- レシート印刷（Bluetoothプリンター/ブラウザ印刷）
- レシート文言カスタマイズ
- PWA対応（iOSでホーム画面に追加可能）
- オフライン対応（IndexedDB）

## 技術スタック

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Dexie.js (IndexedDB)
- Web Bluetooth API
- Vite PWA Plugin

## インストール

```bash
npm install
```

## 開発

```bash
npm run dev
```

アプリは `http://localhost:5173` で起動します。

## ビルド

```bash
npm run build
```

## PWAとしてインストール

### iOSの場合

1. Safariでアプリを開く
2. 共有ボタンをタップ
3. 「ホーム画面に追加」を選択
4. 「追加」をタップ

### Android/Chromeの場合

1. Chromeでアプリを開く
2. アドレスバーの「ホーム画面に追加」アイコンをタップ
3. 「インストール」をタップ

## プリンター対応

### Android/PC（Web Bluetooth API対応）

- Star Micronics mPOP / mC-Print3
- EPSON TM-m30 / TM-P80
- その他ESC/POS対応プリンター

「プリンター」タブからプリンターを接続してください。

### iOS（印刷ダイアログ）

iOSはWeb Bluetooth APIをサポートしていないため、AirPrint対応プリンターを使用してください。

## ディレクトリ構成

```
src/
├── components/       # UIコンポーネント
├── hooks/           # カスタムフック
├── store/           # IndexedDB設定・コンテキスト
├── types/           # TypeScript型定義
└── utils/           # ユーティリティ（ESC/POSコマンドなど）
```

## ライセンス

MIT
