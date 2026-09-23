export type Dimension =
  | 'novelty'
  | 'intimacy'
  | 'initiative'
  | 'desired'
  | 'openness'
  | 'satisfaction'
  | 'boredom'
  | 'intensity';

export type Question = {
  id: string;
  text: string;
  dimension: Dimension;
  reverse?: boolean;
};

export const DIMENSIONS: Record<
  Dimension,
  { label: string; short: string; kind: 'preference' | 'state' }
> = {
  novelty: { label: '新しい刺激への関心', short: '刺激', kind: 'preference' },
  intimacy: { label: '親密さ・つながり重視', short: '親密', kind: 'preference' },
  initiative: { label: '自分から動きたい度', short: '主導', kind: 'preference' },
  desired: { label: '相手から求められたい度', short: '求められたい', kind: 'preference' },
  openness: { label: '欲求を言葉にする開放度', short: '表現', kind: 'preference' },
  satisfaction: { label: '現在の関係満足度', short: '満足', kind: 'state' },
  boredom: { label: '現在のマンネリ感', short: 'マンネリ', kind: 'state' },
  intensity: { label: '現在の欲求強度', short: '欲求強度', kind: 'state' },
};

export const QUESTIONS: Question[] = [
  { id: 'q01', text: 'いつもと違うデートや過ごし方を試すと気分が上がる', dimension: 'novelty' },
  { id: 'q02', text: '慣れた流れより、新しい体験を取り入れたいと思うことが多い', dimension: 'novelty' },
  { id: 'q03', text: '変化よりも、安心できるいつもの過ごし方を選びたい', dimension: 'novelty', reverse: true },
  { id: 'q04', text: '身体的なこと以上に、気持ちがつながっている感覚を大切にしたい', dimension: 'intimacy' },
  { id: 'q05', text: '深い会話やスキンシップがあると満たされやすい', dimension: 'intimacy' },
  { id: 'q06', text: '親密な時間に、感情的なつながりはそれほど重要ではない', dimension: 'intimacy', reverse: true },
  { id: 'q07', text: '自分から誘ったり、きっかけを作ったりする方だ', dimension: 'initiative' },
  { id: 'q08', text: 'やってみたいことがあれば、自分から提案したい', dimension: 'initiative' },
  { id: 'q09', text: '自分から動くより、相手にリードしてほしいことが多い', dimension: 'initiative', reverse: true },
  { id: 'q10', text: '相手から求められると、愛情や魅力を感じやすい', dimension: 'desired' },
  { id: 'q11', text: '「必要とされている」「選ばれている」と感じることが大切だ', dimension: 'desired' },
  { id: 'q12', text: '相手から求められるかどうかは、自分の満足感にあまり影響しない', dimension: 'desired', reverse: true },
  { id: 'q13', text: '自分の希望や苦手なことを、相手に比較的言葉で伝えられる', dimension: 'openness' },
  { id: 'q14', text: '親密な関係について、相手と率直に話し合うことに抵抗が少ない', dimension: 'openness' },
  { id: 'q15', text: '言いたいことがあっても、気まずくなりそうで黙ることが多い', dimension: 'openness', reverse: true },
  { id: 'q16', text: '今のパートナーシップや親密さに、おおむね満足している', dimension: 'satisfaction' },
  { id: 'q17', text: '今の関係には、自分が大切にしたいものがある程度満たされている', dimension: 'satisfaction' },
  { id: 'q18', text: '最近、関係の中で満たされない感覚が続いている', dimension: 'satisfaction', reverse: true },
  { id: 'q19', text: '最近、二人の過ごし方がワンパターンに感じる', dimension: 'boredom' },
  { id: 'q20', text: '以前よりも、新鮮さやドキドキが減ったと感じる', dimension: 'boredom' },
  { id: 'q21', text: '今の関係には、まだ十分な新鮮さがあると感じる', dimension: 'boredom', reverse: true },
  { id: 'q22', text: '最近、親密な時間を持ちたいと思うことが多い', dimension: 'intensity' },
  { id: 'q23', text: 'ここ数週間、自分の欲求を意識する場面が多い', dimension: 'intensity' },
  { id: 'q24', text: '最近は、親密なことへの関心があまり湧かない', dimension: 'intensity', reverse: true },
];
