import { track } from './analytics';
import type { Dimension } from '../data/questions';
import type { Scores } from './scoring';
import { GAP_TEXT, PAIR_ASKS, comparePair, decodePairCode, encodePairCode } from './pair';

type Labels = Record<Dimension, { label: string; kind: 'preference' | 'state' }>;

const ERRORS = {
  empty: '相手のコードを入力してください。',
  format: 'コードの形式が正しくありません。16文字(例: AB12-CD34-EF56-GH78)を確認してください。',
  checksum: 'コードを正しく読み取れませんでした。入力ミスがないか、もう一度確認してください。',
  version: 'このコードは読み取れません。相手に、最新の画面でコードを作り直してもらってください。',
} as const;

const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

// コード・スコアはこのモジュールの外へ出さない(通信・保存・解析送信なし)。
export function initPairUi(labels: Labels) {
  const myCodeEl = byId<HTMLElement>('pair-my-code');
  const statusEl = byId<HTMLElement>('pair-status');
  const form = byId<HTMLFormElement>('pair-form');
  const input = byId<HTMLInputElement>('pair-partner-code');
  const errorEl = byId<HTMLElement>('pair-error');
  const resultEl = byId<HTMLElement>('pair-result');
  let mine: Scores | null = null;
  let myCode = '';

  const copy = async (text: string, message: string, method: string) => {
    try {
      await navigator.clipboard.writeText(text);
      statusEl.textContent = message;
      track('result_share', { method });
    } catch {
      window.getSelection()?.selectAllChildren(myCodeEl);
      statusEl.textContent = 'コピーできませんでした。選択したコードを、長押しまたは Ctrl/Cmd+C でコピーしてください。';
    }
  };

  const inviteText = () =>
    [
      'INTIMETRYの欲求MAPをやってみて。24問・約3分で、登録は不要だよ。',
      '結果のあとに出る「パートナーと比べてみる」に、私のコードを入れると二人の違いが見られるよ。',
      `私のコード: ${myCode}`,
      `${location.origin}/check/`,
      '※結果はブラウザの中だけで計算され、サーバーには保存されません。',
    ].join('\n');

  byId('pair-copy-code').addEventListener('click', () => {
    if (myCode) void copy(myCode, 'コードをコピーしました。相手にだけ送ってください。', 'pair_code');
  });
  byId('pair-copy-invite').addEventListener('click', () => {
    if (myCode) void copy(inviteText(), '招待メッセージをコピーしました。相手にだけ送ってください。', 'pair_invite');
  });

  const clearResult = () => {
    resultEl.hidden = true;
    resultEl.replaceChildren();
  };

  const renderComparison = (partner: Scores) => {
    if (!mine) return;
    const rows = comparePair(mine, partner);
    const gaps = rows.filter((row) => row.level !== 'close').sort((a, b) => b.gap - a.gap).slice(0, 2);

    const heading = node('h3', undefined, '二人の違い');
    heading.tabIndex = -1;
    const summary = node(
      'p',
      'pair-summary',
      gaps.length
        ? `違いが大きめの項目: ${gaps.map((row) => labels[row.dimension].label).join('、')}。まずはここから話してみませんか。`
        : '全体的に近い傾向です。共通点を言葉にしてみるのも、いい会話のきっかけになります。',
    );
    const list = node('div', 'pair-rows');

    for (const row of rows) {
      const meta = labels[row.dimension];
      const head = node('div', 'pair-row-head');
      head.append(node('span', 'pair-label', meta.label));
      if (meta.kind === 'state') head.append(node('span', 'pair-tag', '今の状態'));

      const bar = (who: string, value: number, tone: 'mine' | 'theirs') => {
        const line = node('div', 'pair-bar');
        const track = node('span', 'pair-track');
        const fill = node('span', `pair-fill ${tone}`);
        fill.style.width = `${value}%`;
        track.append(fill);
        line.append(node('span', 'pair-who', who), track, node('b', undefined, String(value)));
        return line;
      };

      const element = node('div', 'pair-row');
      element.dataset.level = row.level;
      element.append(head, bar('あなた', row.mine, 'mine'), bar('相手', row.partner, 'theirs'), node('p', 'pair-gap', `差 ${row.gap}・${GAP_TEXT[row.level]}`));
      if (row.level !== 'close') element.append(node('p', 'pair-ask', `聞いてみる: ${PAIR_ASKS[row.dimension]}`));
      list.append(element);
    }

    const note = node(
      'p',
      'pair-note',
      '数字は優劣や相性の良し悪しではありません。「今の状態」の項目は、時期によって変わります。結果は、二人で話すためのきっかけとして使ってください。',
    );

    resultEl.replaceChildren(heading, summary, list, note);
    resultEl.hidden = false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    resultEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    heading.focus({ preventScroll: true });
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    errorEl.textContent = '';
    const decoded = decodePairCode(input.value);
    if (!decoded.ok) {
      clearResult();
      errorEl.textContent = ERRORS[decoded.reason];
      return;
    }
    renderComparison(decoded.scores);
  });

  return {
    setScores(scores: Scores) {
      mine = scores;
      myCode = encodePairCode(scores);
      myCodeEl.textContent = myCode;
      statusEl.textContent = '';
      errorEl.textContent = '';
      clearResult();
    },
    reset() {
      mine = null;
      myCode = '';
      myCodeEl.textContent = '';
      statusEl.textContent = '';
      errorEl.textContent = '';
      input.value = '';
      clearResult();
    },
  };
}

