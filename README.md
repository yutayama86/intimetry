# INTIMETRY MVP

「性生活を、もっと豊かに。」をミッションに、18歳以上向けの欲求MAP・匿名相談・情報提供を行うMVPです。

## 本番ドメイン

- https://intimetry.com
- Registrar / DNS: Cloudflare
- Hosting: Cloudflare Pages

## 方針

- 成人向けMBTI/16タイプ診断とは競争しない
- タイプ名より連続スコアを主役にする
- Preference（比較的安定した傾向）と NOW（現在状態）を分離する
- MVPでは診断回答・個別スコアをサーバーへ保存しない
- 匿名相談は診断回答と紐付けず、相談対応と明示同意のある匿名コンテンツ化に限定する
- GA4にも診断回答値・個別スコア・相談本文を送らない
- 医学的・心理学的診断を標榜しない

## 技術

- Astro 7 + TypeScript
- Cloudflare Pages
- Cloudflare Pages Functions
- Cloudflare Turnstile
- Resend（問い合わせ・匿名相談メール）
- GA4 / Google Search Console
- GitHub Actions

## ローカル起動

```bash
npm install
npm run dev
```

## 公開前チェック

- [x] 正式ブランド名をINTIMETRYで進行
- [x] `intimetry.com` 取得
- [x] コード上の `PUBLIC_SITE_URL` 既定値を `https://intimetry.com` に設定
- [x] Cloudflare Pagesプロジェクト作成・GitHub連携
- [ ] Pages Functionsの環境変数設定
- [x] Turnstile作成・Site Key / Secret Key設定
- [x] Resend送信元ドメイン認証
- [ ] GA4プロパティ作成・`PUBLIC_GA4_ID`設定
- [ ] Google Search Console登録・sitemap送信
- [ ] 本番フォーム送信テスト
- [ ] 公開後QA

## Cloudflare Pages環境変数

Cloudflareダッシュボードを設定の正本とする。Wrangler設定ファイルは置かない。

### テキスト変数
- `PUBLIC_SITE_URL=https://intimetry.com`
- `PUBLIC_GA4_ID`
- `PUBLIC_TURNSTILE_SITE_KEY`
- `CONTACT_FROM=INTIMETRY <noreply@intimetry.com>`
- `ALLOWED_ORIGINS=https://intimetry.com`

### シークレット
- `RESEND_API_KEY`
- `CONTACT_TO`
- `CONSULT_TO`
- `TURNSTILE_SECRET_KEY`

## GA4イベント

- `diagnosis_start`
- `diagnosis_complete`
- `result_share`
- `recommendation_click`
- `contact_submit`
- `consult_submit`

診断回答値・個別スコア・相談本文などのセンシティブな内容はイベントパラメータに入れません。

## 診断ロジック

`src/data/questions.ts` に24問を定義しています。各軸3問で1〜5点、逆転項目を含み、0〜100へ正規化します。

現在の軸はMVP仮説です。心理尺度として妥当性確認された検査ではありません。公開後は以下を確認して改善します。

- 完了率 / 質問別離脱
- 回答分布の偏り
- 天井・床効果
- 質問間の冗長性
- ユーザーインタビュー
- 必要に応じて心理・医療・セクシュアルウェルネス領域の専門家レビュー

## 匿名相談MVP

`/consult/` では、セックスレス・性欲差・マンネリ・誘い方・性的な好み等の相談を匿名で受け付けます。ニックネームと返信用メールは任意です。公開可否は本人が明示的に選択し、公開可の場合も個人を特定し得る情報を削除・変更してから利用します。診断・治療・緊急対応は行いません。

## Phase 2候補

- ペア招待
- GAP TRANSLATOR（二人の差分翻訳）
- 定期再チェック / HISTORY
- コンテンツレコメンド
- 法令・媒体規約を確認した上での商品/サービス送客

ペア回答や履歴をサーバー保存する前に、データ最小化、保存期間、削除手段、暗号化、アクセス制御、プライバシーポリシー更新を実施します。
