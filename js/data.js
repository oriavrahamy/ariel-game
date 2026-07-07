export const brawlers = [
  {
    id: 'ariel', name: 'אריאל העכבר', image: 'דמויות/אריאל העכבר.png',
    color: '#4CAF50', rarity: 'נפוץ', role: 'Damage Dealer',
    hp: 4800, damage: 220, superName: 'מכת זנב', superDamage: 0.30,
    desc: 'ברולר התחלה זריז עם זנב חזק', unlockTrophies: 0,
    speed: 'רגיל', range: 'בינוני', reload: 1.2
  },
  {
    id: 'oof', name: 'אוףאגרוף', image: 'דמויות/אוףאגרוף.png',
    color: '#8D6E63', rarity: 'נפוץ', role: 'Tank',
    hp: 5600, damage: 200, superName: 'אוף כפול', superDamage: 0.25,
    desc: 'אגרוף אחד ודי', unlockTrophies: 5,
    speed: 'איטי', range: 'קרוב', reload: 1.5
  },
  {
    id: 'yechezkel', name: 'יחזקאל', image: 'דמויות/יחזקאל.png',
    color: '#1565C0', rarity: 'נדיר', role: 'Controller',
    hp: 4400, damage: 240, superName: 'סופת חול', superDamage: 0.30,
    desc: 'לוחם מדבר קשוח עם רוח חזקה', unlockTrophies: 20,
    speed: 'רגיל', range: 'בינוני', reload: 1.3
  },
  {
    id: 'johnny', name: 'ג\'וני', image: 'דמויות/ג\'וני.png',
    color: '#E65100', rarity: 'נדיר', role: 'Assassin',
    hp: 3600, damage: 300, superName: 'ריקוד אש', superDamage: 0.40,
    desc: 'רקדן לוהט עם אגרופים בוערים', unlockTrophies: 40,
    speed: 'מהיר', range: 'קרוב', reload: 1.0
  },
  {
    id: 'foy', name: 'פפוי', image: 'דמויות/פפוי.png',
    color: '#FDD835', rarity: 'נדיר', role: 'Assassin',
    hp: 3400, damage: 320, superName: 'פוי משולש', superDamage: 0.40,
    desc: 'מהיר וקטלני', unlockTrophies: 65,
    speed: 'מהיר', range: 'קרוב', reload: 0.9
  },
  {
    id: 'cat', name: 'חתול', image: 'דמויות/חתול.png',
    color: '#7B1FA2', rarity: 'סופר נדיר', role: 'Sniper',
    hp: 3200, damage: 340, superName: 'שריטה משולשת', superDamage: 0.45,
    desc: 'חתול פראי עם טפרים חדים', unlockTrophies: 100,
    speed: 'רגיל', range: 'רחוק', reload: 1.4
  },
  {
    id: 'paroh', name: 'פרעה', image: 'דמויות/פרעה.png',
    color: '#FF8F00', rarity: 'סופר נדיר', role: 'Controller',
    hp: 4600, damage: 230, superName: 'קללת פרעה', superDamage: 0.35,
    desc: 'מלך מצרים העתיקה עם קסם עתיק', unlockTrophies: 150,
    speed: 'איטי', range: 'בינוני', reload: 1.3
  },
  {
    id: 'yerucham', name: 'ירוחם', image: 'דמויות/ירוחם.png',
    color: '#C62828', rarity: 'סופר נדיר', role: 'Tank',
    hp: 6400, damage: 170, superName: 'רחמים', superDamage: -0.35,
    desc: 'טנק איטי אבל בלתי עציר עם ריפוי', unlockTrophies: 210,
    speed: 'איטי', range: 'קרוב', reload: 1.6
  },
  {
    id: 'mamtera', name: 'מני ממטרה', image: 'דמויות/מני ממטרה.png',
    color: '#00ACC1', rarity: 'אפי', role: 'Thrower',
    hp: 4000, damage: 260, superName: 'ממטרת על', superDamage: 0.40,
    desc: 'מרטיב את כולם בלי רחמים', unlockTrophies: 280,
    speed: 'רגיל', range: 'רחוק', reload: 1.1
  },
  {
    id: 'kafkaf', name: 'כףכף לפנים', image: 'דמויות/כףכף לפנים.png',
    color: '#00695C', rarity: 'אפי', role: 'Damage Dealer',
    hp: 4400, damage: 280, superName: 'מחיאת על', superDamage: 0.50,
    desc: 'מחיאת כף עוצמתית מטלטלת את הזירה', unlockTrophies: 360,
    speed: 'רגיל', range: 'בינוני', reload: 1.2
  },
  {
    id: 'tzachi', name: 'צחי', image: 'דמויות/צחי.png',
    color: '#F57F17', rarity: 'מיתי', role: 'Damage Dealer',
    hp: 5000, damage: 310, superName: 'צחוק מתגלגל', superDamage: 0.40,
    desc: 'צוחק אחרון צוחק הכי טוב', unlockTrophies: 500,
    speed: 'רגיל', range: 'בינוני', reload: 1.0
  },
  {
    id: 'avraham', name: '?? אגדה ??', image: 'דמויות/1XgZwUf7tBPzVpNapxjE.png',
    color: '#D50000', rarity: 'אולטרה אגדי', role: 'Damage Dealer',
    hp: 7000, damage: 350, superName: 'סוד', superDamage: 0.60,
    desc: '???', unlockTrophies: 800,
    speed: 'מהיר', range: 'רחוק', reload: 0.8
  }
];

export const worlds = [
  {
    id: 'fraction-forest', name: 'יער השברים', emoji: '🌲',
    topic: 'המרת שברים לאחוזים', color: '#4CAF50',
    levels: [
      { name: 'שלב 1', enemy: { id: 'nita', name: 'שועל יער', hp: 2000, color: '#C62828' } },
      { name: 'שלב 2', enemy: { id: 'poco', name: 'עץ נודד', hp: 2800, color: '#00695C' } },
      { name: 'שלב 3 - בוס', enemy: { id: 'bull', name: 'דב יער', hp: 4000, color: '#E65100' } }
    ]
  },
  {
    id: 'value-valley', name: 'עמק הערך', emoji: '🏞️',
    topic: 'מציאת ערך האחוז', color: '#1565C0',
    levels: [
      { name: 'שלב 1', enemy: { id: 'poco', name: 'סלע מתגלגל', hp: 2400, color: '#00695C' } },
      { name: 'שלב 2', enemy: { id: 'shelly', name: 'רוח מעמק', hp: 3000, color: '#4CAF50' } },
      { name: 'שלב 3 - בוס', enemy: { id: 'colt', name: 'שומר העמק', hp: 4500, color: '#1565C0' } }
    ]
  },
  {
    id: 'discount-city', name: 'עיר ההנחות', emoji: '🏙️',
    topic: 'הנחות והתייקרויות', color: '#E65100',
    levels: [
      { name: 'שלב 1', enemy: { id: 'primo', name: 'סוחר זועם', hp: 2800, color: '#B71C1C' } },
      { name: 'שלב 2', enemy: { id: 'brock', name: 'מנהל חנות', hp: 3400, color: '#7B1FA2' } },
      { name: 'שלב 3 - בוס', enemy: { id: 'colt', name: 'מאבטח קניון', hp: 5000, color: '#1565C0' } }
    ]
  },
  {
    id: 'boss-mountain', name: 'הר הבוס', emoji: '🏔️',
    topic: 'מציאת השלם (100%)', color: '#C62828',
    levels: [
      { name: 'שלב 1', enemy: { id: 'nita', name: 'שלגון זועם', hp: 3600, color: '#C62828' } },
      { name: 'שלב 2', enemy: { id: 'bull', name: 'בולדר', hp: 4200, color: '#E65100' } },
      { name: 'שלב 3 - בוס על', enemy: { id: 'primo', name: 'מלך ההר', hp: 6000, color: '#B71C1C' } }
    ]
  }
];

export const shopItems = [
  { id: 'hp-up', name: 'חיזוק חיים +20%', icon: '❤️', cost: 50, desc: 'מוסיף 20% חיים לכל דמות' },
  { id: 'dmg-up', name: 'שיפור נזק +15%', icon: '⚔️', cost: 75, desc: 'מוסיף 15% נזק להתקפות' },
  { id: 'super-charge', name: 'אולטי מיידי', icon: '💥', cost: 100, desc: 'מטעין את האולטי ל-100%' },
  { id: 'xp-boost', name: 'בוסט ניסיון x2', icon: '📈', cost: 60, desc: 'כמות XP מוכפלת בקרב הבא' }
];

export const lossTips = [
  '💡 פספסת ב-10%! זכור ש-1/10 הוא בדיוק 10%',
  '💡 כדי למצוא אחוז, חלק את המספר ב-100 והכפל באחוז',
  '💡 50% = חצי, 25% = רבע, 10% = עשירית',
  '💡 הנחה של 20% = משלמים 80% מהמחיר',
  '💡 כדי למצוא 100%: חלק את הערך באחוז (כעשרוני)',
  '💡 75% זה 3/4 - תמיד אפשר להמיר חזרה'
];

export const RARITY_COLORS = {
  'נפוץ': '#B0BEC5', 'נדיר': '#4CAF50', 'סופר נדיר': '#2196F3',
  'אפי': '#9C27B0', 'מיתי': '#FF6F00', 'אולטרה אגדי': '#D50000'
};
