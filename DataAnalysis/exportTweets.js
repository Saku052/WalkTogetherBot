require('dotenv').config({ path: '../.env' });
const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');
const path = require('path');

const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET_KEY,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
});

const roClient = client.readOnly;

async function exportMyTweets(maxResults = 100) {
  try {
    console.log('自分のツイートを取得中...');
    
    // 自分のユーザー情報を取得
    const me = await roClient.v2.me();
    console.log(`ユーザー: ${me.data.username} (${me.data.name})`);
    
    // 自分のツイートを取得
    const tweets = await roClient.v2.userTimeline(me.data.id, {
      max_results: maxResults,
      'tweet.fields': ['created_at', 'public_metrics', 'context_annotations', 'lang'],
      expansions: ['referenced_tweets.id']
    });
    
    console.log('API Response:', JSON.stringify(tweets, null, 2));
    
    if (!tweets.data || tweets.data.length === 0) {
      console.log('ツイートが見つかりませんでした。');
      return;
    }
    
    // CSVヘッダー
    const csvHeader = 'ID,作成日時,ツイート内容,いいね数,リツイート数,返信数,引用数,言語,タイプ\n';
    
    // ツイートデータをCSV形式に変換
    const csvData = tweets.data.map(tweet => {
      const metrics = tweet.public_metrics;
      const tweetType = tweet.referenced_tweets?.[0]?.type || 'original';
      
      // CSVエスケープ処理
      const escapeCsv = (text) => {
        if (!text) return '';
        return `"${text.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '')}"`;
      };
      
      return [
        tweet.id,
        tweet.created_at,
        escapeCsv(tweet.text),
        metrics.like_count,
        metrics.retweet_count,
        metrics.reply_count,
        metrics.quote_count,
        tweet.lang || 'unknown',
        tweetType
      ].join(',');
    }).join('\n');
    
    // ファイル名（日時付き）
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const filename = path.join(__dirname, `my_tweets_${timestamp}.csv`);
    
    // CSVファイル書き出し
    fs.writeFileSync(filename, csvHeader + csvData, 'utf8');
    
    console.log(`✅ ${tweets.data.length}件のツイートを ${filename} にエクスポートしました！`);
    console.log(`📊 統計:`);
    console.log(`   - 総ツイート数: ${tweets.data.length}`);
    console.log(`   - 平均いいね数: ${Math.round(tweets.data.reduce((sum, t) => sum + t.public_metrics.like_count, 0) / tweets.data.length)}`);
    console.log(`   - 平均リツイート数: ${Math.round(tweets.data.reduce((sum, t) => sum + t.public_metrics.retweet_count, 0) / tweets.data.length)}`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    if (error.code === 429) {
      console.log('レート制限に達しました。15分後に再試行してください。');
    }
  }
}

// コマンドライン引数で件数指定可能
const maxResults = process.argv[2] ? parseInt(process.argv[2]) : 100;
exportMyTweets(maxResults);