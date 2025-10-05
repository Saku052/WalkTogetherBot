# WalkTogetherBot

ゲーム開発に関するツイートをAI生成して自動投稿するTwitterボットです。

## 概要

このボットは、ゲーム開発を趣味とする大学生のペルソナで、日々の学びや気付き、達成をツイートします。トレンド分析機能により、話題のトピックを自動で抽出し、関連性の高いツイートを生成します。

## 主な機能

- **AI自動ツイート生成**: OpenAI GPT-4o-miniを使用したツイート生成
- **トレンド分析**: Twitter APIでハッシュタグ検索し、話題のトピックを自動抽出
- **スケジュール実行**: 成功率分析に基づいた最適な時間帯に自動投稿
- **環境変数管理**: Twitter API・OpenAI API認証情報を安全に管理

## 必要な環境

- Node.js (v14以上推奨)
- Twitter Developer Account
- Twitter API v2のアクセス権限
- OpenAI APIキー

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下の認証情報を設定してください：

```env
# Twitter API認証情報
API_KEY=your_api_key_here
API_SECRET_KEY=your_api_secret_key_here
BEARER_TOKEN=your_bearer_token_here
ACCESS_TOKEN=your_access_token_here
ACCESS_TOKEN_SECRET=your_access_token_secret_here

# OpenAI API認証情報
OPENAI_API_KEY=your_openai_api_key_here

# その他（オプション）
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
```

### 3. API認証情報の取得

#### Twitter API
1. [Twitter Developer Portal](https://developer.twitter.com/) にアクセス
2. アプリケーションを作成
3. API Key、API Secret Key、Bearer Token、Access Token、Access Token Secretを取得
4. `.env`ファイルに設定

#### OpenAI API
1. [OpenAI Platform](https://platform.openai.com/) にアクセス
2. APIキーを作成
3. `.env`ファイルに設定

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

### トレンド分析
- **毎日6時**: ハッシュタグ `#ゲーム開発 #ゲーム制作 #プログラミング` のツイートを分析し、トレンドトピックを抽出

### AI自動ツイート（平日）
- **0時15分**: 80%成功率
- **2時30分**: 80%成功率
- **21時45分**: 75%成功率
- **23時10分**: 75%成功率

### AI自動ツイート（休日）
- **2時20分**: 100%成功率
- **5時35分**: 100%成功率
- **14時25分**: 昼休み効果
- **23時50分**: 75%成功率

## プロジェクト構成

```
WalkTogetherBot/
├── index.js          # メインアプリケーションファイル
├── aiGenerator.js    # AI ツイート生成クラス
├── trendAnalyzer.js  # トレンド分析クラス
├── tweets.js         # フォールバック用ツイート
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
- **openai**: OpenAI GPT APIとの連携

## アーキテクチャ

### トレンド分析の仕組み

1. **ツイート収集**: Twitter API v2で指定ハッシュタグのツイートを最大100件取得
2. **トピック抽出**: GPT-4o-miniでツイート群を分析し、3-5個のトレンドトピックを抽出
3. **テーマ反映**: 抽出したトピックを優先的にツイート生成テーマに追加（約70%の確率で選択）
4. **自動更新**: 毎日6時に自動更新

### AI生成の仕組み

1. **システムプロンプト**: ゲーム開発好きの大学生ペルソナを定義
2. **例文学習**: 8つの例文から口調・スタイルを学習
3. **テーマ選択**: トレンド優先でテーマをランダム選択
4. **ツイート生成**: GPT-4o-miniで140文字以内のツイートを生成

## 注意事項

- `.env`ファイルは公開リポジトリにコミットしないでください
- Twitter APIの利用制限に注意してください（無料プランは月50万ツイート読み取り可能）
- OpenAI APIの利用料金に注意してください
- ボットの利用はTwitterの利用規約に従って行ってください

## ライセンス

ISC