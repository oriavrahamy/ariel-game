export const brawlers = [
  {
    id: 'ariel',
    name: 'אריאל העכבר',
    image: 'דמויות/אריאל העכבר.png',
    color: '#4CAF50',
    rarity: 'נפוץ',
    hp: 4800,
    damage: 220,
    superName: 'מכת זנב',
    superDamage: 0.25,
    desc: 'ברולר התחלה זריז עם זנב חזק',
    unlockTrophies: 0
  },
  {
    id: 'oof',
    name: 'אוףאגרוף',
    image: 'דמויות/אוףאגרוף.png',
    color: '#8D6E63',
    rarity: 'נפוץ',
    hp: 4400,
    damage: 240,
    superName: 'אוף כפול',
    superDamage: 0.30,
    desc: 'אגרוף אחד ודי',
    unlockTrophies: 5
  },
  {
    id: 'yechezkel',
    name: 'יחזקאל',
    image: 'דמויות/יחזקאל.png',
    color: '#1565C0',
    rarity: 'נדיר',
    hp: 5200,
    damage: 200,
    superName: 'סופת חול',
    superDamage: 0.30,
    desc: 'לוחם מדבר קשוח עם רוח חזקה',
    unlockTrophies: 20
  },
  {
    id: 'johnny',
    name: 'ג\'וני',
    image: 'דמויות/ג\'וני.png',
    color: '#E65100',
    rarity: 'נדיר',
    hp: 4000,
    damage: 260,
    superName: 'ריקוד אש',
    superDamage: 0.35,
    desc: 'רקדן לוהט עם אגרופים בוערים',
    unlockTrophies: 40
  },
  {
    id: 'foy',
    name: 'פפוי',
    image: 'דמויות/פפוי.png',
    color: '#FDD835',
    rarity: 'נדיר',
    hp: 3800,
    damage: 280,
    superName: 'פוי משולש',
    superDamage: 0.35,
    desc: 'מהיר וקטלני',
    unlockTrophies: 65
  },
  {
    id: 'cat',
    name: 'חתול',
    image: 'דמויות/חתול.png',
    color: '#7B1FA2',
    rarity: 'סופר נדיר',
    hp: 3600,
    damage: 300,
    superName: 'שריטה משולשת',
    superDamage: 0.35,
    desc: 'חתול פראי עם טפרים חדים',
    unlockTrophies: 100
  },
  {
    id: 'paroh',
    name: 'פרעה',
    image: 'דמויות/פרעה.png',
    color: '#FF8F00',
    rarity: 'סופר נדיר',
    hp: 5000,
    damage: 210,
    superName: 'קללת פרעה',
    superDamage: 0.30,
    desc: 'מלך מצרים העתיקה עם קסם עתיק',
    unlockTrophies: 150
  },
  {
    id: 'yerucham',
    name: 'ירוחם',
    image: 'דמויות/ירוחם.png',
    color: '#C62828',
    rarity: 'סופר נדיר',
    hp: 6000,
    damage: 180,
    superName: 'רחמים',
    superDamage: -0.30,
    desc: 'טנק איטי אבל בלתי עציר עם ריפוי',
    unlockTrophies: 210
  },
  {
    id: 'mamtera',
    name: 'מני ממטרה',
    image: 'דמויות/מני ממטרה.png',
    color: '#00ACC1',
    rarity: 'אפי',
    hp: 4200,
    damage: 230,
    superName: 'ממטרת על',
    superDamage: 0.35,
    desc: 'מרטיב את כולם בלי רחמים',
    unlockTrophies: 280
  },
  {
    id: 'kafkaf',
    name: 'כףכף לפנים',
    image: 'דמויות/כףכף לפנים.png',
    color: '#00695C',
    rarity: 'אפי',
    hp: 4400,
    damage: 240,
    superName: 'מחיאת על',
    superDamage: 0.40,
    desc: 'מחיאת כף עוצמתית מטלטלת את הזירה',
    unlockTrophies: 360
  },
  {
    id: 'tzachi',
    name: 'צחי',
    image: 'דמויות/צחי.png',
    color: '#F57F17',
    rarity: 'מיתי',
    hp: 5000,
    damage: 250,
    superName: 'צחוק מתגלגל',
    superDamage: 0.30,
    desc: 'צוחק אחרון צוחק הכי טוב',
    unlockTrophies: 500
  },
  {
    id: 'avraham',
    name: '?? אגדה ??',
    image: 'דמויות/1XgZwUf7tBPzVpNapxjE.png',
    color: '#D50000',
    rarity: 'אגדה',
    hp: 7000,
    damage: 300,
    superName: 'סוד',
    superDamage: 0.50,
    desc: '???',
    unlockTrophies: 800
  }
];

export const worlds = [
  {
    id: 'fraction-forest',
    name: 'יער השברים',
    emoji: '🌲',
    topic: 'המרת שברים לאחוזים',
    color: '#4CAF50',
    levels: [
      { name: 'שלב 1 - שברים פשוטים', enemy: { id: 'nita', name: 'שועל יער', hp: 1500, color: '#C62828' } },
      { name: 'שלב 2 - עשרונים', enemy: { id: 'poco', name: 'עץ נודד', hp: 2000, color: '#00695C' } },
      { name: 'שלב 3 - אתגר בוס', enemy: { id: 'bull', name: 'דב יער', hp: 3000, color: '#E65100' } }
    ]
  },
  {
    id: 'value-valley',
    name: 'עמק הערך',
    emoji: '🏞️',
    topic: 'מציאת ערך האחוז',
    color: '#1565C0',
    levels: [
      { name: 'שלב 1 - אחוזים פשוטים', enemy: { id: 'poco', name: 'סלע מתגלגל', hp: 1800, color: '#00695C' } },
      { name: 'שלב 2 - בינוניים', enemy: { id: 'shelly', name: 'רוח מעמק', hp: 2200, color: '#4CAF50' } },
      { name: 'שלב 3 - בוס העמק', enemy: { id: 'colt', name: 'שומר העמק', hp: 3500, color: '#1565C0' } }
    ]
  },
  {
    id: 'discount-city',
    name: 'עיר ההנחות',
    emoji: '🏙️',
    topic: 'הנחות והתייקרויות',
    color: '#E65100',
    levels: [
      { name: 'שלב 1 - הנחות פשוטות', enemy: { id: 'primo', name: 'סוחר זועם', hp: 2000, color: '#B71C1C' } },
      { name: 'שלב 2 - התייקרויות', enemy: { id: 'brock', name: 'מנהל חנות', hp: 2500, color: '#7B1FA2' } },
      { name: 'שלב 3 - בוס הקניון', enemy: { id: 'colt', name: 'מאבטח קניון', hp: 4000, color: '#1565C0' } }
    ]
  },
  {
    id: 'boss-mountain',
    name: 'הר הבוס',
    emoji: '🏔️',
    topic: 'מציאת השלם (100%)',
    color: '#C62828',
    levels: [
      { name: 'שלב 1 - בסיסי', enemy: { id: 'nita', name: 'שלגון זועם', hp: 2800, color: '#C62828' } },
      { name: 'שלב 2 - מתקדם', enemy: { id: 'bull', name: 'בולדר', hp: 3200, color: '#E65100' } },
      { name: 'שלב 3 - בוס העל', enemy: { id: 'primo', name: 'מלך ההר', hp: 5000, color: '#B71C1C' } }
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
  'נפוץ': '#B0BEC5',
  'נדיר': '#4CAF50',
  'סופר נדיר': '#2196F3',
  'אפי': '#9C27B0',
  'מיתי': '#FF6F00'
};
