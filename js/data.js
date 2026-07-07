export const brawlers = [
  {
    id: 'centurion',
    name: 'Centurion',
    emoji: '🛡️',
    color: '#8B5CF6',
    hp: 5000,
    damage: 250,
    superDamage: 0.25,
    superName: 'מכת מגן',
    desc: 'טנק עם מכת מגן קטלנית'
  },
  {
    id: 'violet',
    name: 'Violet',
    emoji: '💜',
    color: '#EC4899',
    hp: 3500,
    damage: 180,
    superDamage: -0.30,
    superName: 'ריפוי אחוזים',
    desc: 'מרפאה עם בוסט של 30%'
  },
  {
    id: 'spark',
    name: 'Spark',
    emoji: '⚡',
    color: '#F59E0B',
    hp: 3200,
    damage: 200,
    superDamage: 0.15,
    superName: 'מכת ברק כפולה',
    desc: 'תקיפת קומבו מהירה'
  },
  {
    id: 'titan',
    name: 'Titan',
    emoji: '💥',
    color: '#6366F1',
    hp: 6000,
    damage: 300,
    superDamage: 0.40,
    superName: 'ריסוק ענק',
    desc: 'מחסל בוסים, 40% נזק לאויבים חלשים'
  }
];

export const worlds = [
  {
    id: 'fraction-forest',
    name: 'יער השברים',
    emoji: '🌲',
    topic: 'המרת שברים לאחוזים',
    color: '#10B981',
    unlocked: true,
    levels: [
      {
        name: 'שלב 1 - שברים פשוטים',
        enemy: { name: 'שומר היער', emoji: '🌿', hp: 1500, color: '#065F46' }
      },
      {
        name: 'שלב 2 - עשרונים',
        enemy: { name: 'זאב העשרונים', emoji: '🐺', hp: 2000, color: '#047857' }
      },
      {
        name: 'שלב 3 - אתגר בוס',
        enemy: { name: 'מכנה ענק', emoji: '👹', hp: 3000, color: '#022C22' }
      }
    ]
  },
  {
    id: 'value-valley',
    name: 'עמק הערך',
    emoji: '🏞️',
    topic: 'מציאת ערך האחוז',
    color: '#06B6D4',
    unlocked: true,
    levels: [
      {
        name: 'שלב 1 - אחוזים פשוטים',
        enemy: { name: 'שומר העמק', emoji: '🪨', hp: 1800, color: '#0E7490' }
      },
      {
        name: 'שלב 2 - בינוניים',
        enemy: { name: 'צייד האחוזים', emoji: '🏹', hp: 2200, color: '#155E75' }
      },
      {
        name: 'שלב 3 - בוס העמק',
        enemy: { name: 'מלך האחוזים', emoji: '👑', hp: 3500, color: '#164E63' }
      }
    ]
  },
  {
    id: 'discount-city',
    name: 'עיר ההנחות',
    emoji: '🏙️',
    topic: 'הנחות והתייקרויות',
    color: '#F59E0B',
    unlocked: true,
    levels: [
      {
        name: 'שלב 1 - הנחות פשוטות',
        enemy: { name: 'סוכן המבצעים', emoji: '🕴️', hp: 2000, color: '#92400E' }
      },
      {
        name: 'שלב 2 - התייקרויות',
        enemy: { name: 'אינפלטור', emoji: '📈', hp: 2500, color: '#B45309' }
      },
      {
        name: 'שלב 3 - בוס הקניון',
        enemy: { name: 'טייקון הקניות', emoji: '🛍️', hp: 4000, color: '#78350F' }
      }
    ]
  },
  {
    id: 'boss-mountain',
    name: 'הר הבוס',
    emoji: '🏔️',
    topic: 'מציאת השלם (100%)',
    color: '#EF4444',
    unlocked: true,
    levels: [
      {
        name: 'שלב 1 - בסיסי',
        enemy: { name: 'שומר ההר', emoji: '🗿', hp: 2800, color: '#7F1D1D' }
      },
      {
        name: 'שלב 2 - מתקדם',
        enemy: { name: 'צוק המבחן', emoji: '⛰️', hp: 3200, color: '#991B1B' }
      },
      {
        name: 'שלב 3 - בוס העל',
        enemy: { name: 'אחוזון האימה', emoji: '🐉', hp: 5000, color: '#450A0A' }
      }
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
