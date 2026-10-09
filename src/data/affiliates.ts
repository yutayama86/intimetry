export type AffiliateId = 'kimochi';

export type Affiliate = {
  id: AffiliateId;
  name: string;
  href: string;
  title: string;
  body: string;
  button: string;
  note: string;
};

// href は A8.net の「商品リンク作成」で発行したURLを、そのまま入れる(改変禁止)。
// 飛び先は広告主指定の https://kimochi-mental.com/client/home 内。
export const AFFILIATES: Record<AffiliateId, Affiliate> = {
  kimochi: {
    id: 'kimochi',
    name: 'Kimochi',
    href: 'https://px.a8.net/svt/ejp?a8mat=4BEBP4+AVR9LM+5OI8+BW8O2&a8ejpredirect=https%3A%2F%2Fkimochi-mental.com%2Fclient%2Fhome',
    title: '気持ちを整理するための、相談先の一つ',
    body: '一人で抱えるのがつらいときは、オンラインで心理カウンセリングを受けられるサービスもあります。Kimochiは、ビデオやチャットなどで相談できる月額制のサービスで、利用には登録と料金が必要です。内容・料金・条件は、公式サイトで確認してください。',
    button: 'Kimochiの公式サイトを見る(PR)',
    note: 'このページ経由で申し込まれた場合、INTIMETRYが広告主から報酬を受け取ることがあります。このサービスは診断や治療を行うものではありません。',
  },
};
