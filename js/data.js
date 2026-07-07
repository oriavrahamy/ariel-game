export function brawlerSVG(id, size = 60) {
  const svgs = {
    shelly: `<svg width="${size}" height="${size}" viewBox="0 0 60 60"><rect x="8" y="8" width="44" height="44" rx="2" fill="#4CAF50" stroke="#000" stroke-width="3"/><rect x="14" y="14" width="32" height="10" rx="2" fill="#2E7D32" stroke="#000" stroke-width="2"/><rect x="12" y="28" width="36" height="20" rx="2" fill="#81C784" stroke="#000" stroke-width="2"/><rect x="20" y="32" width="8" height="6" fill="#000"/><rect x="32" y="32" width="8" height="6" fill="#000"/><rect x="24" y="42" width="12" height="3" fill="#000"/></svg>`,
    colt: `<svg width="${size}" height="${size}" viewBox="0 0 60 60"><rect x="8" y="8" width="44" height="44" rx="2" fill="#1565C0" stroke="#000" stroke-width="3"/><rect x="14" y="12" width="32" height="14" rx="2" fill="#1976D2" stroke="#000" stroke-width="2"/><rect x="12" y="30" width="36" height="18" rx="2" fill="#42A5F5" stroke="#000" stroke-width="2"/><rect x="18" y="34" width="8" height="6" fill="#000"/><rect x="34" y="34" width="8" height="6" fill="#000"/><rect x="10" y="26" width="40" height="3" fill="#0D47A1"/></svg>`,
    bull: `<svg width="${size}" height="${size}" viewBox="0 0 60 60"><rect x="8" y="8" width="44" height="44" rx="2" fill="#E65100" stroke="#000" stroke-width="3"/><rect x="14" y="12" width="32" height="12" rx="2" fill="#EF6C00" stroke="#000" stroke-width="2"/><rect x="10" y="28" width="40" height="20" rx="2" fill="#FF9800" stroke="#000" stroke-width="2"/><rect x="18" y="32" width="8" height="6" fill="#000"/><rect x="34" y="32" width="8" height="6" fill="#000"/><rect x="22" y="42" width="16" height="4" fill="#000"/></svg>`,
    brock: `<svg width="${size}" height="${size}" viewBox="0 0 60 60"><rect x="8" y="8" width="44" height="44" rx="2" fill="#7B1FA2" stroke="#000" stroke-width="3"/><rect x="14" y="12" width="32" height="12" rx="2" fill="#8E24AA" stroke="#000" stroke-width="2"/><rect x="12" y="28" width="36" height="20" rx="2" fill="#CE93D8" stroke="#000" stroke-width="2"/><rect x="18" y="32" width="8" height="6" fill="#000"/><rect x="34" y="32" width="8" height="6" fill="#000"/><rect x="12" y="44" width="36" height="3" fill="#4A148C"/></svg>`,
    nita: `<svg width="${size}" height="${size}" viewBox="0 0 60 60"><rect x="8" y="8" width="44" height="44" rx="2" fill="#C62828" stroke="#000" stroke-width="3"/><rect x="14" y="12" width="32" height="14" rx="2" fill="#D32F2F" stroke="#000" stroke-width="2"/><rect x="12" y="30" width="36" height="18" rx="2" fill="#EF5350" stroke="#000" stroke-width="2"/><rect x="18" y="34" width="6" height="6" fill="#000"/><rect x="36" y="34" width="6" height="6" fill="#000"/><rect x="24" y="42" width="12" height="3" fill="#000"/></svg>`,
    poco: `<svg width="${size}" height="${size}" viewBox="0 0 60 60"><rect x="8" y="8" width="44" height="44" rx="2" fill="#00695C" stroke="#000" stroke-width="3"/><rect x="14" y="12" width="32" height="12" rx="2" fill="#00897B" stroke="#000" stroke-width="2"/><rect x="12" y="28" width="36" height="20" rx="2" fill="#26A69A" stroke="#000" stroke-width="2"/><circle cx="21" cy="36" r="4" fill="#000"/><circle cx="39" cy="36" r="4" fill="#000"/><rect x="24" y="44" width="12" height="3" fill="#000"/></svg>`,
    primo: `<svg width="${size}" height="${size}" viewBox="0 0 60 60"><rect x="8" y="8" width="44" height="44" rx="2" fill="#B71C1C" stroke="#000" stroke-width="3"/><rect x="14" y="12" width="32" height="12" rx="2" fill="#C62828" stroke="#000" stroke-width="2"/><rect x="10" y="28" width="40" height="20" rx="2" fill="#E53935" stroke="#000" stroke-width="2"/><rect x="16" y="32" width="10" height="8" fill="#000"/><rect x="34" y="32" width="10" height="8" fill="#000"/><rect x="20" y="44" width="20" height="3" fill="#000"/></svg>`
  };
  return svgs[id] || svgs.shelly;
}

export const brawlers = [
  {
    id: 'shelly',
    name: 'Shelly',
    svgId: 'shelly',
    color: '#4CAF50',
    hp: 4800,
    damage: 220,
    superDamage: 0.25,
    superName: 'מכת צדף',
    desc: 'ברולרית התחלה עם רובה ציד חזק'
  },
  {
    id: 'colt',
    name: 'Colt',
    svgId: 'colt',
    color: '#1565C0',
    hp: 3600,
    damage: 280,
    superDamage: 0.30,
    superName: 'סופת כדורים',
    desc: 'יורה מהיר עם שני אקדחים'
  },
  {
    id: 'bull',
    name: 'Bull',
    svgId: 'bull',
    color: '#E65100',
    hp: 6000,
    damage: 200,
    superDamage: -0.25,
    superName: 'ריפוי מהיר',
    desc: 'טנק כבד עם רובה ציד לטווח קרוב'
  },
  {
    id: 'brock',
    name: 'Brock',
    svgId: 'brock',
    color: '#7B1FA2',
    hp: 3200,
    damage: 260,
    superDamage: 0.35,
    superName: 'מטר טילים',
    desc: 'צלף עם רקטות ארוכות טווח'
  }
];

export const worlds = [
  {
    id: 'fraction-forest',
    name: 'יער השברים',
    emoji: '🌲',
    topic: 'המרת שברים לאחוזים',
    color: '#4CAF50',
    unlocked: true,
    levels: [
      { name: 'שלב 1 - שברים פשוטים', enemy: { id: 'nita', name: 'Nita', svgId: 'nita', hp: 1500, color: '#C62828' } },
      { name: 'שלב 2 - עשרונים', enemy: { id: 'poco', name: 'Poco', svgId: 'poco', hp: 2000, color: '#00695C' } },
      { name: 'שלב 3 - אתגר בוס', enemy: { id: 'bull', name: 'Bull', svgId: 'bull', hp: 3000, color: '#E65100' } }
    ]
  },
  {
    id: 'value-valley',
    name: 'עמק הערך',
    emoji: '🏞️',
    topic: 'מציאת ערך האחוז',
    color: '#1565C0',
    unlocked: true,
    levels: [
      { name: 'שלב 1 - אחוזים פשוטים', enemy: { id: 'poco', name: 'Poco', svgId: 'poco', hp: 1800, color: '#00695C' } },
      { name: 'שלב 2 - בינוניים', enemy: { id: 'shelly', name: 'Shelly', svgId: 'shelly', hp: 2200, color: '#4CAF50' } },
      { name: 'שלב 3 - בוס העמק', enemy: { id: 'colt', name: 'Colt', svgId: 'colt', hp: 3500, color: '#1565C0' } }
    ]
  },
  {
    id: 'discount-city',
    name: 'עיר ההנחות',
    emoji: '🏙️',
    topic: 'הנחות והתייקרויות',
    color: '#E65100',
    unlocked: true,
    levels: [
      { name: 'שלב 1 - הנחות פשוטות', enemy: { id: 'primo', name: 'El Primo', svgId: 'primo', hp: 2000, color: '#B71C1C' } },
      { name: 'שלב 2 - התייקרויות', enemy: { id: 'brock', name: 'Brock', svgId: 'brock', hp: 2500, color: '#7B1FA2' } },
      { name: 'שלב 3 - בוס הקניון', enemy: { id: 'colt', name: 'Colt', svgId: 'colt', hp: 4000, color: '#1565C0' } }
    ]
  },
  {
    id: 'boss-mountain',
    name: 'הר הבוס',
    emoji: '🏔️',
    topic: 'מציאת השלם (100%)',
    color: '#C62828',
    unlocked: true,
    levels: [
      { name: 'שלב 1 - בסיסי', enemy: { id: 'nita', name: 'Nita', svgId: 'nita', hp: 2800, color: '#C62828' } },
      { name: 'שלב 2 - מתקדם', enemy: { id: 'bull', name: 'Bull', svgId: 'bull', hp: 3200, color: '#E65100' } },
      { name: 'שלב 3 - בוס העל', enemy: { id: 'primo', name: 'El Primo', svgId: 'primo', hp: 5000, color: '#B71C1C' } }
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
