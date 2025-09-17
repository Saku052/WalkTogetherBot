# WalkTogetherBot

楽天モバイル社員紹介キャンペーンを自動で宣伝するTwitterボットです。

## 概要

このボットは、楽天モバイルの社員紹介キャンペーンに関するツイートを自動で投稿します。毎日決まった時間にメッセージを投稿し、キャンペーンの認知度向上を図ります。

## 主な機能

- **自動ツイート投稿**: 楽天モバイル社員紹介キャンペーンの宣伝ツイートを自動投稿
- **スケジュール実行**: 毎日午前9時と午後6時に自動実行
- **環境変数管理**: Twitter API認証情報を安全に管理

## 必要な環境

- Node.js (v14以上推奨)
- Twitter Developer Account
- Twitter API v2のアクセス権限

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、Twitter APIの認証情報を設定してください：

```env
API_KEY=your_api_key_here
API_SECRET_KEY=your_api_secret_key_here
ACCESS_TOKEN=your_access_token_here
ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

### 3. Twitter API認証情報の取得

1. [Twitter Developer Portal](https://developer.twitter.com/) にアクセス
2. アプリケーションを作成
3. API Key、API Secret Key、Access Token、Access Token Secretを取得
4. `.env`ファイルに設定

## 使用方法

### ボットの起動

```bash
npm start
```

または

```bash
node index.js
```

ボットが起動すると、以下のスケジュールで自動実行されます：

- **午前9時**: 「おはようございます！楽天モバイル社員紹介キャンペーン。今なら相当なポイントがもらえます！」
- **午後6時**: 「今日も1日お疲れ様です！楽天モバイル社員紹介キャンペーン。今なら相当なポイントがもらえます！」

## プロジェクト構成

```
WalkTogetherBot/
├── index.js          # メインアプリケーションファイル
├── package.json      # プロジェクト設定と依存関係
├── package-lock.json # 依存関係のロックファイル
├── .env             # 環境変数（要作成）
├── .gitignore       # Git除外設定
└── README.md        # このファイル
```

## 使用ライブラリ

- **twitter-api-v2**: Twitter API v2との連携
- **node-cron**: スケジュールタスクの実行
- **dotenv**: 環境変数の管理

## 注意事項

- `.env`ファイルは公開リポジトリにコミットしないでください
- Twitter APIの利用制限に注意してください
- ボットの利用はTwitterの利用規約に従って行ってください

## ライセンス

ISC