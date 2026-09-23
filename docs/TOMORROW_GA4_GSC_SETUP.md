# INTIMETRY｜GA4・Search Console・sitemap・本番QA 手順書

実施予定日：2026-09-25  
対象サイト：https://intimetry.com

## 目的

明日の作業は次の4点を完了させる。

- GA4でアクセス・主要イベントを計測開始
- Google Search Consoleに `intimetry.com` を登録
- `sitemap-index.xml` をSearch Consoleへ送信
- 本番公開後の最終QAを完了

コード側はすでにGA4イベント、robots.txt、sitemap、canonical、構造化データ、本番フォームまで実装・QA済み。

---

## 0. 作業前の確認

ブラウザで以下が開くことを確認する。

- https://intimetry.com/
- https://intimetry.com/check/
- https://intimetry.com/consult/
- https://intimetry.com/robots.txt
- https://intimetry.com/sitemap-index.xml

`robots.txt` 内に次があればOK。

```
Sitemap: https://intimetry.com/sitemap-index.xml
```

---

# 1. GA4

## 1-1. GA4プロパティを作成

Google Analyticsを開き、INTIMETRYで使うGoogleアカウントにログイン。

1. 左下「管理」
2. 正しいAnalyticsアカウントを選択
3. 「プロパティを作成」
4. 以下で作成

| 項目 | 設定 |
|---|---|
| プロパティ名 | INTIMETRY |
| レポートのタイムゾーン | 日本 |
| 通貨 | 日本円（JPY） |

業種やビジネス規模の質問は、近い項目で問題なし。

## 1-2. Webデータストリームを作成

1. 「データ ストリーム」
2. 「ストリームを追加」
3. 「ウェブ」
4. 以下を入力

| 項目 | 設定 |
|---|---|
| ウェブサイトURL | https://intimetry.com |
| ストリーム名 | INTIMETRY Web |
| 拡張計測機能 | ON |

作成後、`G-` から始まる「測定ID」をコピーする。

例：

```
G-XXXXXXXXXX
```

※測定IDはSecretではない。

## 1-3. Cloudflare PagesへGA4 IDを設定

Cloudflare Dashboard →

**Workers & Pages → INTIMETRY Pages → Settings / 設定 → Variables and Secrets / 変数とシークレット**

以下を追加。

| 変数名 | 値 | 種別 |
|---|---|---|
| PUBLIC_GA4_ID | G-XXXXXXXXXX | テキスト |

保存後、**Productionを再デプロイ**する。

再デプロイ方法はどちらでもOK。

- Deploymentsから最新Productionを再デプロイ
- GitHub mainへ新しいコミットを入れて自動デプロイ

## 1-4. GA4計測確認

本番再デプロイ後、広告ブロッカーをOFFにしたブラウザで以下を行う。

1. https://intimetry.com/ を開く
2. /check/ を開く
3. 「チェックを始める」を押す

GA4 →

**レポート → リアルタイム**

で自分のアクセスが確認できればOK。

最低限確認するイベント：

- `page_view`
- `diagnosis_start`

以下は運用開始後に順次確認すればよい。

- `diagnosis_complete`
- `result_share`
- `recommendation_click`
- `contact_submit`
- `consult_submit`

注意：診断の個別回答値・個別スコア・相談本文はGA4へ送らない実装になっている。

---

# 2. Google Search Console

## 2-1. Domainプロパティを作成

Google Search Consoleを開く。

1. 左上のプロパティ選択
2. 「プロパティを追加」
3. **ドメイン** を選択
4. 次だけ入力

```
intimetry.com
```

`https://` や末尾スラッシュは付けない。

## 2-2. DNS所有権確認

Search Consoleに `google-site-verification=...` のTXT値が表示される。

Cloudflare →

**intimetry.com → DNS → Records → Add record**

以下で追加。

| 項目 | 設定 |
|---|---|
| Type | TXT |
| Name | @ |
| Content | Googleが表示した google-site-verification=... |
| TTL | Auto |

重要：

- Resend用のSPF/DKIM等は削除・変更しない
- 新しいTXTレコードを「追加」するだけ

保存後、Search Consoleへ戻り「確認」。

成功したら、Domain property：

```
sc-domain:intimetry.com
```

の状態になる。

---

# 3. sitemap送信

Search Consoleで `intimetry.com` を選択。

1. 左メニュー「サイトマップ」
2. 「新しいサイトマップの追加」
3. 入力

```
sitemap-index.xml
```

4. 「送信」

最終的にステータスが **成功しました / Success** になれば完了。

公開URL：

https://intimetry.com/sitemap-index.xml

robots.txtにも同URLを記載済みなので、Googleによる自動検出経路も確保済み。

## 任意：重要URLのインデックス登録をリクエスト

URL検査で以下を優先。

1. https://intimetry.com/
2. https://intimetry.com/check/
3. https://intimetry.com/consult/
4. https://intimetry.com/articles/

各URLを検査し、必要に応じて「インデックス登録をリクエスト」。

サイトマップ送信が主なので、ここは必須ではない。

---

# 4. 本番QA

## A. 公開・SEO

- [ ] https://intimetry.com がHTTPSで表示
- [ ] PC表示崩れなし
- [ ] スマホ表示崩れなし
- [ ] /check/ が開く
- [ ] /consult/ が開く
- [ ] /contact/ が開く
- [ ] /privacy/ が開く
- [ ] /terms/ が開く
- [ ] /advertising/ が開く
- [ ] robots.txt が表示
- [ ] sitemap-index.xml が表示
- [ ] Search Console sitemap = Success

## B. 欲求MAP

- [ ] チェック開始
- [ ] Part 1〜4を移動できる
- [ ] 未回答時にエラー表示
- [ ] 24問完了
- [ ] 結果スコア表示
- [ ] NEXT ACTION表示
- [ ] 再チェックできる
- [ ] シェアボタン確認
- [ ] 回答内容がGA4へ送られていない

## C. 匿名相談・問い合わせ

- [x] 匿名相談フォームのメール送受信
- [ ] Turnstile正常表示
- [ ] 必須項目バリデーション
- [ ] contactフォーム送信
- [ ] 送信後の完了表示
- [ ] Resend側で送信成功確認

## D. GA4

- [ ] Realtimeでアクセス確認
- [ ] page_view確認
- [ ] diagnosis_start確認
- [ ] diagnosis_complete確認
- [ ] consult_submitまたはcontact_submit確認
- [ ] センシティブな回答・本文がイベントパラメータに含まれていない

## E. Search Console

- [ ] Domain property所有権確認済み
- [ ] sitemap-index.xml送信済み
- [ ] Sitemap status = Success
- [ ] トップページのURL検査
- [ ] /check/ のURL検査

---

# 5. 完了条件

以下5つが揃ったら初期公開設定は完了。

1. GA4 RealtimeでINTIMETRYへのアクセスが見える
2. `diagnosis_start` がGA4に入る
3. Search Consoleの `intimetry.com` Domain propertyがVerified
4. `sitemap-index.xml` がSearch ConsoleでSuccess
5. 本番サイト・欲求MAP・フォームに致命的なエラーなし

---

# ChatGPT Workに任せる場合の指示文

以下をそのまま貼る。

> INTIMETRY（https://intimetry.com）の公開設定を完了してください。Google AnalyticsでINTIMETRY用のGA4プロパティとWebデータストリームを作成し、測定IDをCloudflare PagesのPUBLIC_GA4_IDへ設定してProductionを再デプロイしてください。その後GA4 Realtimeとdiagnosis_startを確認してください。Google Search ConsoleにはDomain propertyとしてintimetry.comを追加し、Cloudflare DNSへ所有権確認用TXTレコードを追加して認証してください。認証後、https://intimetry.com/sitemap-index.xml を送信し、ステータスがSuccessになることを確認してください。最後にPC・スマホ、主要URL、欲求MAP、匿名相談・問い合わせ、robots.txt、sitemap、canonical、GA4イベントを本番QAし、残エラーがあれば解消まで進めてください。既存のResend、Turnstile、DNSレコードを壊さないでください。

---

## 作業ログ

- GA4 Property：
- GA4 Measurement ID：
- Search Console Property：`sc-domain:intimetry.com`
- Sitemap：`https://intimetry.com/sitemap-index.xml`
- 完了日：
