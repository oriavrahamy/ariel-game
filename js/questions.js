import { worlds } from './data.js';

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateWrongAnswers(correct, count = 3, strategy) {
  const wrongs = new Set();
  const strategies = Array.isArray(strategy) ? strategy : [strategy];
  let attempts = 0;

  while (wrongs.size < count && attempts < 50) {
    attempts++;
    const strat = pick(strategies);
    let val = null;

    if (typeof strat === 'function') {
      val = strat(correct);
    } else if (strat === 'offset') {
      const offsets = [-10, -5, -1, 1, 5, 10, -20, 20, -50, 50, -25, 25];
      val = correct + pick(offsets);
    } else if (strat === 'percentage_point') {
      val = correct + pick([-5, 5, -10, 10, -2, 2, -1, 1]);
    } else if (strat === 'factor') {
      const factors = [10, 0.1, 2, 0.5, 5, 0.2];
      val = Math.round(correct * pick(factors));
    } else if (strat === 'near') {
      const pct = pick([0.8, 0.9, 1.1, 1.2, 0.85, 1.15]);
      val = Math.round(correct * pct);
    }

    if (val !== null && val !== correct && val > 0 && !wrongs.has(val)) {
      wrongs.add(val);
    }
  }

  while (wrongs.size < count) {
    wrongs.add(correct + wrongs.size + 1);
  }

  return [...wrongs].slice(0, count);
}

function createQuestion(questionText, correctAnswer, wrongAnswers) {
  const answers = shuffle([correctAnswer, ...wrongAnswers]);
  const correctIndex = answers.indexOf(correctAnswer);
  return { q: questionText, a: answers, c: correctIndex };
}

function ensureHebrewNumber(n) {
  return String(n).replace('.', ',');
}

function difficultyScore(type, params) {
  switch (type) {
    case 'fraction_to_pct':
      if (params.den <= 5) return 1;
      if (params.den <= 20) return params.num > 1 ? 2 : 1;
      return params.den <= 50 ? 3 : 4;

    case 'decimal_to_pct':
      return 2;

    case 'pct_to_fraction':
      if ([50, 25, 75, 10, 20].includes(params.pct)) return 3;
      return 4;

    case 'find_pct':
      if (params.pct <= 50 && params.pct % 5 === 0 && params.base <= 200) return 1;
      if (params.pct % 5 === 0 && params.base <= 500) return 2;
      return params.base <= 1000 ? 3 : 4;

    case 'discount':
      if (params.discount <= 25 && params.price <= 100) return 1;
      if (params.discount <= 50 && params.price <= 500) return 2;
      return 3;

    case 'find_whole':
      if (params.pct >= 20 && params.pct % 5 === 0 && params.value <= 100) return 1;
      if (params.pct >= 10 && params.value <= 200) return 2;
      return 3;

    default:
      return 2;
  }
}

/* ===== GENERATOR 1: Fraction Forest ===== */
function genFractionToPct(level) {
  const configs = {
    1: { dens: [2, 4, 5, 10], label: 'פשוט' },
    2: { dens: [3, 6, 8, 20, 25, 50], label: 'בינוני' },
    3: { dens: [7, 9, 12, 15, 30, 40], label: 'מתקדם' }
  };
  const cfg = configs[level] || configs[1];

  if (Math.random() < 0.4 && level >= 2) {
    return genDecimalToPct(level);
  }
  if (Math.random() < 0.3 && level >= 3) {
    return genPctToFraction(level);
  }

  const den = pick(cfg.dens);
  const num = rand(1, den - 1);
  const pct = Math.round((num / den) * 1000) / 10;
  const isWhole = pct === Math.floor(pct);
  const displayPct = isWhole ? String(pct) : pct.toFixed(1);
  const q = `מהו ${num}/${den} באחוזים?`;

  const score = difficultyScore('fraction_to_pct', { den, num });

  const finalPct = Math.round(pct);
  const wrongs = generateWrongAnswers(finalPct, 3, [
    (c) => Math.round(c * 0.1),
    (c) => Math.round(c * 0.5),
    (c) => Math.round(c * 1.5),
    (c) => Math.round(c) + rand(-15, 15),
    (c) => Math.round(num / den * 1000) / 10,
    (c) => den,
    (c) => den * 10,
    (c) => num * 10,
    (c) => Math.round(100 / den),
    (c) => Math.round((den - num) / den * 100),
  ]);

  const question = createQuestion(q, finalPct + '%', wrongs.map(w => w + '%'));
  return { ...question, _score: score, _topic: 'fraction_to_pct' };
}

function genDecimalToPct(level) {
  const decimals = level === 1
    ? [0.5, 0.25, 0.75, 0.1, 0.2]
    : level === 2
    ? [0.4, 0.6, 0.8, 0.15, 0.35, 0.05, 0.01]
    : [0.02, 0.08, 0.12, 0.45, 0.55, 0.65, 0.85];

  const dec = pick(decimals);
  const pct = Math.round(dec * 100);
  const q = `מהו ${ensureHebrewNumber(dec)} באחוזים?`;

  const wrongs = generateWrongAnswers(pct, 3, [
    (c) => c * 10,
    (c) => Math.round(c / 10),
    (c) => Math.round(c / 2) || 1,
    (c) => c + rand(-5, 5),
  ]);

  const question = createQuestion(q, pct + '%', wrongs.map(w => w + '%'));
  return { ...question, _score: difficultyScore('decimal_to_pct', {}), _topic: 'decimal_to_pct' };
}

function genPctToFraction(level) {
  const pairs = level === 1
    ? [[50, '1/2'], [25, '1/4'], [75, '3/4'], [10, '1/10'], [20, '1/5']]
    : level === 2
    ? [[40, '2/5'], [60, '3/5'], [80, '4/5'], [30, '3/10'], [70, '7/10'], [12.5, '1/8']]
    : [[37.5, '3/8'], [62.5, '5/8'], [33.33, '1/3'], [66.66, '2/3'], [83.33, '5/6'], [44.44, '4/9']];

  const [pct, correctFrac] = pick(pairs);
  const pctDisplay = pct === Math.floor(pct) ? `${pct}%` : `${pct}%`;
  const q = `איזה שבר שווה ל-${pctDisplay}?`;

  const allFractions = ['1/2', '1/3', '2/3', '1/4', '3/4', '1/5', '2/5', '3/5', '4/5',
    '1/6', '5/6', '1/8', '3/8', '5/8', '7/8', '1/10', '3/10', '7/10', '1/20'];

  const wrongs = [];
  const pool = allFractions.filter(f => f !== correctFrac);
  while (wrongs.length < 3) {
    const w = pick(pool);
    if (!wrongs.includes(w)) wrongs.push(w);
  }

  const question = createQuestion(q, correctFrac, wrongs);
  return { ...question, _score: difficultyScore('pct_to_fraction', { pct }), _topic: 'pct_to_fraction' };
}

/* ===== GENERATOR 2: Value Valley ===== */
function genFindPctOf(level) {
  const configs = {
    1: { pcts: [10, 20, 25, 50, 75], bases: [80, 100, 120, 200, 300, 400] },
    2: { pcts: [15, 20, 25, 30, 40, 60], bases: [80, 120, 150, 200, 250, 300, 500] },
    3: { pcts: [8, 12, 15, 18, 35, 45, 55, 65], bases: [80, 125, 160, 200, 250, 300, 400, 600, 800] }
  };

  const cfg = configs[level] || configs[1];
  const pct = pick(cfg.pcts);
  const base = pick(cfg.bases);
  const result = Math.round((pct / 100) * base);

  const q = `כמה זה ${pct}% מ-${base}?`;

  const wrongs = generateWrongAnswers(result, 3, [
    (c) => Math.round(base * 0.1),
    (c) => Math.round(base * 0.5),
    (c) => Math.round(pct / 100 * (base + pick([-20, 20, -50, 50]))),
    (c) => Math.round(pct * base / 1000) * 10,
    (c) => c + pick([-5, 5, -10, 10, -1, 1]),
    (c) => Math.round(pct),
    (c) => Math.round(base * pct / 100) + (pct > 50 ? -20 : 20),
  ]);

  const question = createQuestion(q, result, wrongs);
  return { ...question, _score: difficultyScore('find_pct', { pct, base }), _topic: 'find_pct' };
}

/* ===== GENERATOR 3: Discount City ===== */
function genDiscount(level) {
  const isMarkup = level >= 2 && Math.random() < 0.35;
  const types = level === 1
    ? [{ pcts: [10, 20, 25, 50], prices: [50, 80, 100, 120, 200] }]
    : level === 2
    ? [{ pcts: [15, 20, 25, 30, 40], prices: [100, 150, 200, 250, 300, 400] }]
    : [{ pcts: [10, 15, 20, 25, 30, 35, 40], prices: [80, 120, 200, 250, 300, 400, 500] }];

  const cfg = pick(types);
  const pct = pick(cfg.pcts);
  const price = pick(cfg.prices);

  if (level === 3 && Math.random() < 0.25) {
    return genCompoundDiscount(level);
  }

  if (level === 3 && Math.random() < 0.3) {
    return genFindOriginal(level);
  }

  if (isMarkup) {
    const increase = Math.round(price * pct / 100);
    const newPrice = price + increase;
    const q = `מחיר מקורי ${price}₪, התייקר ב-${pct}%. מה המחיר החדש?`;

    const wrongs = generateWrongAnswers(newPrice, 3, [
      (c) => price + pick([5, 10, 15, 20]),
      (c) => price - increase,
      (c) => Math.round(price * (1 + pct / 100 + 0.05)),
      (c) => price + Math.round(price * (pct + 5) / 100),
      (c) => price,
    ]);

    const question = createQuestion(q, newPrice + '₪', wrongs.map(w => w + '₪'));
    return { ...question, _score: difficultyScore('discount', { discount: -pct, price }), _topic: 'markup' };
  }

  const discount = Math.round(price * pct / 100);
  const finalPrice = price - discount;
  const q = `מחיר מקורי ${price}₪, ${pct}% הנחה. מה המחיר אחרי ההנחה?`;

  const wrongs = generateWrongAnswers(finalPrice, 3, [
    (c) => price - pick([5, 10, 15]),
    (c) => discount,
    (c) => Math.round(price * (1 - pct / 200)),
    (c) => Math.round(price * (100 - pct + 5) / 100),
    (c) => price,
    (c) => price + discount,
  ]);

  const question = createQuestion(q, finalPrice + '₪', wrongs.map(w => w + '₪'));
  return { ...question, _score: difficultyScore('discount', { discount: pct, price }), _topic: 'discount' };
}

function genCompoundDiscount(level) {
  const pct1 = pick([10, 15, 20, 25]);
  const pct2 = pick([5, 10, 15]);
  const price = pick([100, 150, 200, 250, 300]);

  const afterFirst = Math.round(price * (100 - pct1) / 100);
  const finalPrice = Math.round(afterFirst * (100 - pct2) / 100);

  const q = `מחיר ${price}₪, ${pct1}% הנחה ואז עוד ${pct2}% הנחה. מחיר סופי?`;

  const wrongs = generateWrongAnswers(finalPrice, 3, [
    (c) => Math.round(price * (100 - pct1 - pct2) / 100),
    (c) => Math.round(price * (100 - pct1) / 100),
    (c) => c + pick([-5, 5, -10, 10]),
    (c) => Math.round(price * (100 - pct1 + pct2) / 100),
  ]);

  const question = createQuestion(q, finalPrice + '₪', wrongs.map(w => w + '₪'));
  return { ...question, _score: 3, _topic: 'compound_discount' };
}

function genFindOriginal(level) {
  const pct = pick([15, 20, 25, 30]);
  const finalPrice = pick([84, 120, 150, 175, 210, 280]);
  const original = Math.round(finalPrice / ((100 - pct) / 100));

  if (original > 999) return genDiscount(level);

  const q = `אחרי ${pct}% הנחה שילמת ${finalPrice}₪. מה היה המחיר המקורי?`;

  const wrongs = generateWrongAnswers(original, 3, [
    (c) => Math.round(finalPrice * (1 + pct / 100)),
    (c) => Math.round(finalPrice + finalPrice * pct / 100) + pick([-10, 10]),
    (c) => finalPrice + Math.round(finalPrice * 0.5),
    (c) => Math.round(finalPrice / (100 - pct - 5) * 100),
  ]);

  const question = createQuestion(q, original + '₪', wrongs.map(w => w + '₪'));
  return { ...question, _score: 3, _topic: 'find_original' };
}

/* ===== GENERATOR 4: Boss Mountain ===== */
function genFindWhole(level) {
  const configs = {
    1: { pcts: [20, 25, 30, 40, 50], values: [12, 15, 20, 25, 30, 40, 50] },
    2: { pcts: [12, 15, 20, 25, 30, 35, 45], values: [24, 27, 36, 45, 56, 60, 70] },
    3: { pcts: [8, 12, 15, 18, 20, 25, 35, 40], values: [24, 30, 36, 45, 56, 65, 84, 96, 120] }
  };

  const cfg = configs[level] || configs[1];
  const pct = pick(cfg.pcts);
  const value = pick(cfg.values);

  let whole;
  if (Math.random() < 0.5) {
    whole = Math.round(value / (pct / 100));
  } else {
    whole = Math.round(value * 100 / pct);
  }

  if (whole > 2000 || whole < 10) {
    return genFindWhole(level);
  }

  const q = `${value} הוא ${pct}% מאיזה מספר?`;

  const wrongs = generateWrongAnswers(whole, 3, [
    (c) => Math.round(value * pct / 10),
    (c) => Math.round(value / (pct / 100) + pick([-20, -10, 10, 20])),
    (c) => Math.round(value * 100 / pct + pick([-50, 50])),
    (c) => Math.round(value * 100 / (pct + 5)),
    (c) => Math.round(value * (100 - pct) / 100),
    (c) => Math.round(value * 10),
  ]);

  const question = createQuestion(q, whole, wrongs);
  return { ...question, _score: difficultyScore('find_whole', { pct, value }), _topic: 'find_whole' };
}

/* ===== MAIN GENERATOR ===== */
export function generateQuestions(worldIndex, levelIndex, count = 10) {
  const world = worlds[worldIndex];
  if (!world) return [];

  const level = world.levels[levelIndex];
  const difficulty = levelIndex + 1;
  const questions = [];

  const generators = {
    'fraction-forest': genFractionToPct,
    'value-valley': genFindPctOf,
    'discount-city': genDiscount,
    'boss-mountain': genFindWhole
  };

  const generator = generators[world.id];
  if (!generator) return [];

  const targetScore = {
    0: { min: 1, max: 2 },
    1: { min: 2, max: 3 },
    2: { min: 2, max: 4 }
  }[levelIndex] || { min: 1, max: 3 };

  let attempts = 0;
  const maxAttempts = 100;

  while (questions.length < count && attempts < maxAttempts) {
    attempts++;
    const q = generator(difficulty);
    if (q._score >= targetScore.min && q._score <= targetScore.max) {
      questions.push(q);
    }
  }

  if (questions.length < count) {
    while (questions.length < count) {
      questions.push(generator(difficulty));
    }
  }

  return questions;
}

export function validateQuestionDifficulty(q, expectedLevel) {
  const ranges = {
    0: [1, 2],
    1: [2, 3],
    2: [2, 4]
  };
  const [min, max] = ranges[expectedLevel] || [1, 3];
  return q._score >= min && q._score <= max && q._score <= 4;
}
