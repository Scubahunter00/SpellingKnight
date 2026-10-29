(() => {
'use strict';

// ---------- constants ----------
const W = 320, H = 192, T = 16, COLS = 20, ROWS = 12;
const MAX_HP = 5;
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
cv.width = W; cv.height = H;
ctx.imageSmoothingEnabled = false;
const FONT = '"Press Start 2P", monospace';

// ---------- stage scaling ----------
const stage = document.getElementById('stage');
function fit() {
  const s = Math.min(innerWidth / 960, innerHeight / 576);
  stage.style.transform = `scale(${s})`;
  stage.style.left = (innerWidth - 960 * s) / 2 + 'px';
  stage.style.top = (innerHeight - 576 * s) / 2 + 'px';
}
addEventListener('resize', fit); fit();

// ---------- sprites ----------
const PAL = { k:'#1a1c2c', s:'#c0cbdc', l:'#73a7ff', b:'#3b5dc9', r:'#b13e53', f:'#f4b98c',
  e:'#1a1c2c', y:'#ffcd75', g:'#38b764', o:'#e8e4d0', p:'#8b5fbf', n:'#8a5a3c', m:'#5d275d',
  w:'#f4f4f4', R:'#ff3b3b', d:'#257179', x:'#333c57', O:'#ff8a2a', q:'#ff9bd5' };

function makeSprite(rows, over = {}) {
  const pal = { ...PAL, ...over };
  const w = Math.max(...rows.map(r => r.length)), h = rows.length;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== '.' && pal[ch]) { g.fillStyle = pal[ch]; g.fillRect(x, y, 1, 1); }
  }));
  return c;
}
function tint(src, color) {
  const c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  const g = c.getContext('2d');
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = color; g.fillRect(0, 0, c.width, c.height);
  return c;
}

const KNIGHT_BODY = [
  '..h............h..',
  '.hh............hh.',
  '.hHk..kkkkkk..kHh.',
  '.hHkkkbbbbllkkkHh.',
  '..kyybbbbbllbbyyk.',
  '...kbbbkkkkbbbk...',
  '...kbbbbkkbbbbk...',
  '...kbbbbkkbbbbk...',
  '....kbbbkkbbbk....',
  '...kkbbbbbbbbkk...',
  '.kllbbbyyyybbblk..',
  '.kllbbbbbbbbbblk..',
  '.kbbkbbyyyybbkbbk.',
  '..kbkbbbbbbbbkbk..',
  '...kkbbddddbbkk...'
];
const KNIGHT_LEGS = {
  idle: ['....kbbk..kbbk....', '....kbbk..kbbk....', '...kkbbk..kbbkk...'],
  a:    ['....kbbk..kbbk....', '...kbbk....kbbk...', '..kkbbk.....kbbkk.'],
  b:    ['....kbbk..kbbk....', '....kbbk..kbk.....', '...kkbbk..kkk.....'],
  c:    ['....kbbk..kbbk....', '...kbbk...kbbk....', '..kbbkk...kkbbk...']
};
const SWORD = [
  '...w...',
  '..wsk..',
  '..wsk..',
  '..wsk..',
  '..wsk..',
  '..wsk..',
  '..wsk..',
  '..wsk..',
  '..wsk..',
  '..wsk..',
  'kkkyykk',
  'kyyyyyk',
  '..knk..',
  '..knk..',
  '..kyk..',
  '...k...'
];
const KNIGHT_PAL = { d: '#1a2a7a', l: '#8fc0ff', b: '#2f55d4', h: '#f2e6b8', H: '#c9a86a', n: '#8a5a3c' };
const KNIGHT_W = 18, KNIGHT_H = 18, HAND = { x: 15, y: 13 }, GRIP = { x: 3.5, y: 13 };
const GOBLIN = [
  'gg..kkkk..gg',
  '.ggkggggkgg.',
  '..kgRggRgk..',
  '..kggggggk..',
  '...kgmmgk...',
  '..kkkkkkkk..',
  '.gknnnnnnkg.',
  '..knnnnnnk..',
  '..kngkkgnk..',
  '..kgg..ggk..',
  '..kkk..kkk..'
];
const KING = [
  '..y.y.y.y...',
  '..yyyyyyy...'
].concat(GOBLIN);
const SKELETON = [
  '...kkkkkk...',
  '..kooooook..',
  '..kookkook..',
  '..kooooook..',
  '...kokokok..',
  '....kkkk....',
  '..kkooookk..',
  '.kookkokkok.',
  '.ko.ooooo.k.',
  '.kookkokkok.',
  '..kkooooook.',
  '...ko.k.ok..',
  '...ko...ok..',
  '..kkk...kkk.'
];
const SLIME = [
  '....kkkk....',
  '..kkggggkk..',
  '.kgglggggk..',
  '.kgwkggwkgk.',
  '.kggggggggk.',
  'kgggggmmgggk',
  'kkkkkkkkkkkk'
];
const BAT = [
  'k..........k',
  'kk..k..k..kk',
  'kpk.kppk.kpk',
  'kppkpeppkppk',
  '.kppppppppk.',
  '..kkpppkk...',
  '....kkk.....'
];
const GHOST = [
  '....kkkk....',
  '..kkwwwwkk..',
  '.kwwwwwwwwk.',
  '.kwkkwwkkwk.',
  '.kwkkwwkkwk.',
  '.kwwwkkwwwk.',
  '.kwwwkkwwwk.',
  '.kwwwwwwwwk.',
  '.kwkwwwwkwk.',
  '..k.kwwk.k..'
];
const HEART = ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'];

const WALL_ROWS = [
  'kkkkkkkkkkkkkk',
  'kaaaaakaaaaabk',
  'kaaaayyaaaaabk',
  'kaaaaykaaaabbk',
  'kkkkkykkkkkkkk',
  'kaaakyyaaakabk',
  'kaaabaykaaaabk',
  'kaaabaaaaaaabk',
  'kkkkkkkkkkkkkk',
  'kaaaakaaaaaaak',
  'kaaaakaaaaaaak',
  'kkkkkkkkkkkkkk'
];
const MIMIC = [
  '..kkkkkkkkkkkk..',
  '.knnnnnnnnnnnnk.',
  'knnyynnnnnnyynnk',
  'knnykynnnnnykynk',
  'kkkkkkkkkkkkkkkk',
  'kwwkwwkwwkwwkwwk',
  'kRRRRRRRRRRRRRRk',
  'kmRRRRRRRRRRRRmk',
  'kwwkwwkwwkwwkwwk',
  'knnnnnnnnnnnnnnk',
  '.kkkkkkkkkkkkkk.'
];
const S = {
  mimic: makeSprite(MIMIC, { n: '#a86b3c', m: '#6b4226' }),
  wall: makeSprite(WALL_ROWS, { a: '#7a7f99', b: '#5a5f79' }),
  goblin: makeSprite(GOBLIN),
  king: makeSprite(KING, { g: '#2b8a3e', n: '#b13e53' }),
  skeleton: makeSprite(SKELETON),
  slime: makeSprite(SLIME, { l: '#b6f5b0', g: '#5bd16b' }),
  bat: makeSprite(BAT, { e: '#ffcd75' }),
  // level variants (recolors)
  toxic: makeSprite(SLIME, { l: '#f0c8ff', g: '#b86bd6' }),
  swamp: makeSprite(GOBLIN, { g: '#3b9a8a', n: '#5b6b3a', R: '#ffe14a' }),
  ghost: makeSprite(GHOST, { w: '#d8e4ff', k: '#4a4e8a' }),
  frostslime: makeSprite(SLIME, { l: '#e8f8ff', g: '#6ec6ff' }),
  icegoblin: makeSprite(GOBLIN, { g: '#8fd3ff', n: '#3b5dc9', R: '#ffffff' }),
  frostbones: makeSprite(SKELETON, { o: '#cfeeff', k: '#2a4a7a' }),
  icebat: makeSprite(BAT, { p: '#6ea8e0', e: '#ffffff' }),
  imp: makeSprite(GOBLIN, { g: '#e0452a', n: '#5d275d', R: '#ffe14a' }),
  firebones: makeSprite(SKELETON, { o: '#ffb070', k: '#3a0f0f' }),
  firebat: makeSprite(BAT, { p: '#ff6a2a', e: '#ffe28a' }),
  heart: makeSprite(HEART),
  heartEmpty: makeSprite(HEART, { r: '#333c57' })
};
const WHITE = {}, RED = {};
// ---------- cosmetics ----------
// Helmets replace the top 5 rows of the knight; the visor rows below are shared.
const HELMETS = {
  horned: { name: 'Horned', price: 0, rows: [
    '..h............h..', '.hh............hh.', '.hHk..kkkkkk..kHh.',
    '.hHkkkbbbbllkkkHh.', '..kyybbbbbllbbyyk.'] },
  bare: { name: 'Plain Helm', price: 10, rows: [
    '..................', '..................', '......kkkkkk......',
    '....kkbbbbllkk....', '...kbbbbbllbbbk...'] },
  propeller: { name: 'Propeller', price: 25, rows: [
    '.....ssssssss.....', '........kk........', '......kRRRRk......',
    '....kkRRyyRRkk....', '...kRRRRyyRRRRk...'] },
  cat: { name: 'Cat Ears', price: 30, rows: [
    '..................', '....kk......kk....', '....kqk....kqk....',
    '....kbbkkkkbbk....', '...kbbbbbllbbbk...'] },
  bucket: { name: 'Bucket', price: 35, rows: [
    '..................', '.....kkkkkkkk.....', '....kssssssssk....',
    '....kllssssssk....', '...kssssssssssk...'] },
  cone: { name: 'Traffic Cone', price: 40, rows: [
    '........kk........', '.......kOOk.......', '......kOwwOk......',
    '.....kOOwwOOk.....', '...kkkOOOOOOkkk...'] },
  chicken: { name: 'Chicken', price: 50, rows: [
    '......RR.RR.......', '.......RRRR.......', '......kwwwwk......',
    '....kkwwwwwwkk....', '...kwwwwwwwwwwk...'] },
  wizard: { name: 'Wizard Hat', price: 60, rows: [
    '........pp........', '.......pppp.......', '......ppyppp......',
    '.kppppppppppppppk.', '...kbbbbbllbbbk...'] },
  crown: { name: 'Royal Crown', price: 100, rows: [
    '..................', '.....y..yy..y.....', '....kyyyrryyyk....',
    '....kkbbbbllkk....', '...kbbbbbllbbbk...'] }
};
const COLORS = {
  blue:   { name: 'Blue',   price: 0,  pal: { b: '#2f55d4', l: '#8fc0ff', d: '#1a2a7a' } },
  red:    { name: 'Red',    price: 15, pal: { b: '#c43a3a', l: '#ff9a8a', d: '#6a1a1a' } },
  green:  { name: 'Green',  price: 15, pal: { b: '#2f9e44', l: '#a6f0a0', d: '#17592a' } },
  purple: { name: 'Purple', price: 20, pal: { b: '#7b3fc4', l: '#d0a8ff', d: '#3e1a6e' } },
  pink:   { name: 'Pink',   price: 25, pal: { b: '#e86bb0', l: '#ffc4e6', d: '#8a2a62' } },
  shadow: { name: 'Shadow', price: 40, pal: { b: '#3a3a4e', l: '#8a8aa8', d: '#14141e' } },
  gold:   { name: 'Golden', price: 75, pal: { b: '#e0a82e', l: '#fff0a0', d: '#8a5a14' } },
  rainbow: { name: 'Rainbow', price: 120, cycle: ['red', 'gold', 'green', 'blue', 'purple', 'pink'] }
};
// A skin picks a replacement palette letter for armor pixels, or null to keep them.
const SKINS = {
  plain:   { name: 'Plain',      price: 0,  fn: () => null },
  stripes: { name: 'Stripes',    price: 15, fn: (x, y) => (y % 2 === 0 ? 'd' : null) },
  checker: { name: 'Checkers',   price: 20, fn: (x, y) => ((x + y) % 2 === 0 ? 'l' : null) },
  polka:   { name: 'Polka Dots', price: 25, fn: (x, y) => ((x % 4 === 1 && y % 4 === 1) || (x % 4 === 3 && y % 4 === 3) ? 'w' : null) },
  flames:  { name: 'Hot Rod',    price: 40, fn: (x, y) => (y >= 11 ? ((x + y) % 3 === 0 ? 'y' : x % 2 ? 'O' : 'R') : null) },
  cow:     { name: 'Cow',        price: 50, fn: (x, y) => ((x * 5 + y * 3) % 7 < 2 ? 'x' : 'w') }
};
const CATALOG = { helmet: HELMETS, color: COLORS, skin: SKINS };

const spriteCache = {};
function knightSprite(look, frame, variant) {
  const col = COLORS[look.color];
  const palId = col.cycle ? col.cycle[Math.floor(time * 6) % col.cycle.length] : look.color;
  const key = [look.helmet, palId, look.skin, frame, variant].join('|');
  if (spriteCache[key]) return spriteCache[key];
  let s;
  if (variant === 'red') s = tint(knightSprite(look, frame, 'normal'), '#ff4d4d');
  else {
    const rows = HELMETS[look.helmet].rows.concat(KNIGHT_BODY.slice(5), KNIGHT_LEGS[frame]);
    const skin = SKINS[look.skin].fn;
    const skinned = rows.map((row, y) =>
      [...row].map((ch, x) => (ch === 'b' && skin(x, y)) || ch).join(''));
    s = makeSprite(skinned, { ...KNIGHT_PAL, ...COLORS[palId].pal });
  }
  return (spriteCache[key] = s);
}
const COIN = makeSprite(['.kkk.', 'kyyyk', 'kyOyk', 'kyyyk', '.kkk.']);
// Weapon registry: add new weapons here (rows = sprite, bonus = extra damage per hit).
const WEAPONS = {
  sword:  { name: 'Iron Sword',   rows: SWORD, pal: KNIGHT_PAL, bonus: 0 },
  steel:  { name: 'Steel Sword',  rows: SWORD, pal: { ...KNIGHT_PAL, s: '#8fd3ff', w: '#e8f8ff' }, bonus: 1 },
  carrot: { name: 'Carrot Sword', rows: SWORD, pal: { ...KNIGHT_PAL, s: '#ff8a2a', w: '#38b764' }, bonus: 1 },
  banana: { name: 'Banana Blade', rows: SWORD, pal: { ...KNIGHT_PAL, s: '#ffe14a', w: '#fff6a8' }, bonus: 1 },
  fire:   { name: 'Fire Sword',   rows: SWORD, pal: { ...KNIGHT_PAL, s: '#ff5a2a', w: '#ffe28a', y: '#b13e53' }, bonus: 2 }
};
for (const [id, w] of Object.entries(WEAPONS)) {
  w.normal = makeSprite(w.rows, w.pal);
  w.red = tint(w.normal, '#ff4d4d');
}
const WALK = ['a', 'b', 'c', 'b'];

const CHEST = {
  closed: makeSprite([
    '..kkkkkkkkkkkk..',
    '.knnnnnnnnnnnnk.',
    'knnmnnnnnnnnmnnk',
    'knnnnnnnnnnnnnnk',
    'kkkkkkkyykkkkkkk',
    'knnnnnnykynnnnnk',
    'knnmnnnnnnnnmnnk',
    'knnnnnnnnnnnnnnk',
    'knnnnnnnnnnnnnnk',
    '.kkkkkkkkkkkkkk.'
  ], { n: '#a86b3c', m: '#6b4226' }),
  open: makeSprite([
    '.kkkkkkkkkkkkkk.',
    'kmmmmmmmmmmmmmmk',
    'kmnnnnnnnnnnnnmk',
    '.kkkkkkkkkkkkkk.',
    'kyyyyyyyyyyyyyyk',
    'knnnnnnnnnnnnnnk',
    'knnmnnnnnnnnmnnk',
    'knnnnnnnnnnnnnnk',
    'knnnnnnnnnnnnnnk',
    '.kkkkkkkkkkkkkk.'
  ], { n: '#a86b3c', m: '#6b4226' })
};
const POT = makeSprite([
  '..kkkkkk..',
  '..kbaabk..',
  '...kkkk...',
  '..kaaaabk.',
  '.kaLaaaabk',
  '.kaLaaaabk',
  '.kaaaaaabk',
  '.kbaaaabbk',
  '..kbbbbbk.',
  '...kkkkk..'
], { a: '#c4683c', b: '#8a3f24', L: '#e8946a' });
const CRATE = makeSprite([
  'kkkkkkkkkkk',
  'kaaaaaaaaak',
  'kakaaaaakak',
  'kaakaaakaak',
  'kaaakakaaak',
  'kaaaakaaaak',
  'kaaakakaaak',
  'kaakaaakaak',
  'kakaaaaakak',
  'kaaaaaaaaak',
  'kkkkkkkkkkk'
], { a: '#b8814a' });
const POTION = makeSprite([
  '...kkk...',
  '...kok...',
  '....k....',
  '...kkk...',
  '..kRRRk..',
  '.kRwRRRk.',
  '.kRRRRRk.',
  '.kRRRRRk.',
  '..kkkkk..'
], { o: '#c9a86a' });

function drawKnight(cx, feetY, scale, flip, frame, ang, variant = 'normal') {
  const body = knightSprite(save.look, frame, variant);
  const sword = WEAPONS[player.weapon][variant];
  ctx.save();
  ctx.translate(Math.round(cx), Math.round(feetY - KNIGHT_H * scale));
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(body, -KNIGHT_W / 2 * scale, 0, KNIGHT_W * scale, KNIGHT_H * scale);
  ctx.translate((HAND.x - KNIGHT_W / 2) * scale, HAND.y * scale);
  ctx.rotate(ang);
  ctx.drawImage(sword, -GRIP.x * scale, -GRIP.y * scale, sword.width * scale, sword.height * scale);
  ctx.restore();
}

// `snd` picks the cry/death sound; `fly` enemies hover.
const ENEMY_TYPES = {
  goblin:     { name: 'Goblin',          spr: 'goblin',     snd: 'goblin',   hp: 2, scale: 2, gold: 5 },
  slime:      { name: 'Slime',           spr: 'slime',      snd: 'slime',    hp: 2, scale: 2, gold: 4 },
  skeleton:   { name: 'Skeleton',        spr: 'skeleton',   snd: 'skeleton', hp: 3, scale: 2, gold: 8 },
  bat:        { name: 'Bat',             spr: 'bat',        snd: 'bat',      hp: 2, scale: 2, gold: 6, fly: true },
  king:       { name: 'Goblin King',     spr: 'king',       snd: 'king',     hp: 5, scale: 3, gold: 30 },
  toxic:      { name: 'Toxic Slime',     spr: 'toxic',      snd: 'slime',    hp: 2, scale: 2, gold: 6 },
  swamp:      { name: 'Swamp Goblin',    spr: 'swamp',      snd: 'goblin',   hp: 2, scale: 2, gold: 7 },
  ghost:      { name: 'Ghost',           spr: 'ghost',      snd: 'ghost',    hp: 3, scale: 2, gold: 9, fly: true },
  frostslime: { name: 'Frost Slime',     spr: 'frostslime', snd: 'slime',    hp: 2, scale: 2, gold: 8 },
  icegoblin:  { name: 'Ice Goblin',      spr: 'icegoblin',  snd: 'goblin',   hp: 3, scale: 2, gold: 9 },
  frostbones: { name: 'Frost Skeleton',  spr: 'frostbones', snd: 'skeleton', hp: 3, scale: 2, gold: 10 },
  icebat:     { name: 'Ice Bat',         spr: 'icebat',     snd: 'bat',      hp: 2, scale: 2, gold: 9, fly: true },
  imp:        { name: 'Fire Imp',        spr: 'imp',        snd: 'goblin',   hp: 3, scale: 2, gold: 11 },
  firebones:  { name: 'Fire Skeleton',   spr: 'firebones',  snd: 'skeleton', hp: 4, scale: 2, gold: 12 },
  firebat:    { name: 'Fire Bat',        spr: 'firebat',    snd: 'bat',      hp: 2, scale: 2, gold: 10, fly: true },
  wall:       { name: 'Cracked Wall',    spr: 'wall',       snd: 'wall',     hp: 1, scale: 3, gold: 0, wall: true },
  mimic:      { name: 'Mimic',           spr: 'mimic',      snd: 'mimic',    hp: 3, scale: 2, gold: 15, mimic: true }
};
for (const t of Object.values(ENEMY_TYPES)) {
  if (!WHITE[t.spr]) { WHITE[t.spr] = tint(S[t.spr], '#ffffff'); RED[t.spr] = tint(S[t.spr], '#ff4d4d'); }
}

// ---------- levels ----------
// Each level uses WORD_BANK[level] and has its own look and monsters.
const LEVELS = [
  { name: 'Dungeon Gate', enemies: ['goblin', 'goblin', 'slime'],
    theme: { floor: ['#44486a', '#4a4e69'], line: '#383b58', hi: '#5a5f80', deco: '#383b58',
      wall: '#2a2d4a', mortar: '#1a1c2c', wallHi: '#3d4170',
      pil: ['#6b6f94', '#8b90b8', '#4a4e69'], flame: ['#ff9b3d', '#ffe28a'], dim: 'rgba(0,0,0,.25)' } },
  { name: 'Slimy Sewer', enemies: ['slime', 'toxic', 'swamp', 'swamp'],
    theme: { floor: ['#3b5a4a', '#3f604e'], line: '#2a4034', hi: '#58806a', deco: '#6fd1a0', puddle: true,
      wall: '#223a33', mortar: '#12241f', wallHi: '#36584c',
      pil: ['#6b9a80', '#8fc2a4', '#4a7060'], flame: ['#7df9a0', '#e0ffe8'], dim: 'rgba(0,30,10,.3)' } },
  { name: 'Haunted Crypt', enemies: ['skeleton', 'skeleton', 'ghost', 'ghost', 'bat'],
    theme: { floor: ['#4a3a5c', '#4e3e62'], line: '#2e2240', hi: '#62507a', deco: '#2e2240',
      wall: '#2a1e3a', mortar: '#160f22', wallHi: '#44335c',
      pil: ['#8a7aa8', '#a898c8', '#5e4e78'], flame: ['#c07dff', '#f0d8ff'], dim: 'rgba(20,0,40,.35)' } },
  { name: 'Frozen Cavern', enemies: ['frostslime', 'icegoblin', 'frostbones', 'icebat', 'icebat'],
    theme: { floor: ['#8fb8d8', '#98c0de'], line: '#6a92b4', hi: '#d0ecff', deco: '#ffffff', sparkle: true,
      wall: '#4a6e96', mortar: '#2e4a6e', wallHi: '#7ea8d0',
      pil: ['#d8f0ff', '#ffffff', '#9cc4e0'], flame: ['#7df9ff', '#ffffff'], dim: 'rgba(0,30,80,.2)' } },
  { name: 'Lava Keep', enemies: ['imp', 'imp', 'firebones', 'firebat', 'king'],
    theme: { floor: ['#4a2a2a', '#4e2c2c'], line: '#2e1618', hi: '#6a3a38', deco: '#ff7a2a', crack: true,
      wall: '#2a1414', mortar: '#140808', wallHi: '#5a2a22',
      pil: ['#7a4a42', '#a8685a', '#4e2e2a'], flame: ['#ff5a2a', '#ffe28a'], dim: 'rgba(40,0,0,.3)' } }
];
const LAST_LEVEL = LEVELS.length;

// ---------- tiles ----------
function tileCanvas(draw) {
  const c = document.createElement('canvas'); c.width = T; c.height = T;
  draw(c.getContext('2d')); return c;
}
function makeTiles(t) {
  const FLOOR = [0, 1].map(v => tileCanvas(g => {
    g.fillStyle = t.floor[v]; g.fillRect(0, 0, T, T);
    g.fillStyle = t.line; g.fillRect(0, 15, T, 1); g.fillRect(15, 0, 1, T);
    g.fillStyle = t.hi; g.fillRect(1, 1, 6, 1);
    if (!v) return;
    g.fillStyle = t.deco;
    if (t.puddle) { g.fillRect(4, 8, 7, 3); g.fillRect(6, 7, 3, 1); }
    else if (t.sparkle) { g.fillRect(8, 5, 1, 5); g.fillRect(6, 7, 5, 1); }
    else if (t.crack) { g.fillRect(5, 5, 2, 1); g.fillRect(6, 6, 2, 1); g.fillRect(7, 7, 2, 2); g.fillRect(9, 9, 2, 1); }
    else { g.fillRect(9, 7, 3, 1); g.fillRect(11, 8, 2, 1); }
  }));
  const WALL = tileCanvas(g => {
    g.fillStyle = t.wall; g.fillRect(0, 0, T, T);
    g.fillStyle = t.mortar;
    g.fillRect(0, 7, T, 1); g.fillRect(0, 15, T, 1); g.fillRect(7, 0, 1, 7); g.fillRect(3, 8, 1, 7); g.fillRect(11, 8, 1, 7);
    g.fillStyle = t.wallHi; g.fillRect(0, 0, 7, 1); g.fillRect(8, 0, 8, 1); g.fillRect(0, 8, 3, 1); g.fillRect(4, 8, 7, 1);
  });
  const PILLAR = tileCanvas(g => {
    g.drawImage(FLOOR[0], 0, 0);
    g.fillStyle = t.mortar; g.fillRect(2, 3, 12, 13);
    g.fillStyle = t.pil[0]; g.fillRect(3, 2, 10, 12);
    g.fillStyle = t.pil[1]; g.fillRect(3, 2, 10, 2);
    g.fillStyle = t.pil[2]; g.fillRect(10, 4, 3, 10);
  });
  return { FLOOR, WALL, PILLAR, flame: t.flame, dim: t.dim };
}
const TILESETS = LEVELS.map(l => makeTiles(l.theme));
let TH = TILESETS[0];

// ---------- audio ----------
let actx;
function beep(freq, dur, type = 'square', vol = 0.06, slide = 0) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, actx.currentTime);
    if (slide) o.frequency.linearRampToValueAtTime(freq + slide, actx.currentTime + dur);
    g.gain.setValueAtTime(vol, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + dur);
  } catch (e) { /* audio unavailable */ }
}
function swish() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const dur = .22, n = Math.floor(actx.sampleRate * dur);
    const buf = actx.createBuffer(1, n, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = actx.createBufferSource(); s.buffer = buf;
    const f = actx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.5;
    f.frequency.setValueAtTime(600, actx.currentTime);
    f.frequency.exponentialRampToValueAtTime(5000, actx.currentTime + dur);
    const g = actx.createGain();
    g.gain.setValueAtTime(.0001, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(.35, actx.currentTime + .08);
    g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + dur);
    s.connect(f); f.connect(g); g.connect(actx.destination); s.start();
  } catch (e) { /* audio unavailable */ }
}
const CRIES = {
  goblin:   () => { beep(420, .28, 'sawtooth', .07, -260); setTimeout(() => beep(300, .15, 'sawtooth', .05, -120), 120); },
  slime:    () => { beep(200, .3, 'sine', .12, 220); setTimeout(() => beep(420, .15, 'sine', .08, -200), 150); },
  skeleton: () => { [0, 60, 120, 180].forEach(t => setTimeout(() => beep(900 - t * 2, .05, 'square', .05), t)); },
  bat:      () => { beep(1800, .1, 'square', .04, -600); setTimeout(() => beep(2000, .12, 'square', .04, -900), 90); },
  king:     () => { beep(160, .5, 'sawtooth', .1, -90); beep(165, .5, 'square', .05, -90); },
  ghost:    () => { beep(500, .5, 'sine', .1, 200); setTimeout(() => beep(700, .4, 'sine', .08, -300), 150); },
  mimic:    () => { beep(110, .25, 'sawtooth', .09, 60); [0, 70, 140].forEach(t => setTimeout(() => beep(700, .04, 'square', .05), t)); }
};
const DEATHS = {
  goblin:   () => { beep(380, .5, 'sawtooth', .08, -330); setTimeout(() => beep(120, .25, 'square', .05, -60), 300); },
  slime:    () => { beep(500, .45, 'sine', .14, -420); setTimeout(() => beep(160, .15, 'sine', .1, -100), 250); drum(actx.currentTime + .05, .25, .05, 800); },
  skeleton: () => { for (let i = 0; i < 7; i++) setTimeout(() => beep(300 + Math.random() * 500, .04, 'square', .05), i * 45); drum(actx.currentTime, .35, .06, 3000); },
  bat:      () => { beep(2200, .45, 'square', .04, -1900); setTimeout(() => beep(900, .15, 'triangle', .05, -500), 350); },
  ghost:    () => { beep(600, 1, 'sine', .1, -450); setTimeout(() => beep(400, .6, 'sine', .07, -300), 200); },
  king:     () => { beep(200, 1.1, 'sawtooth', .1, -150); beep(100, 1.1, 'square', .07, -60); setTimeout(() => drum(actx.currentTime, .6, .08, 300), 500); }
};
const sfx = {
  death(spr) { try { (DEATHS[spr] || DEATHS.goblin)(); } catch (e) { /* audio unavailable */ } },
  attack() { swish(); },
  pickup() {
    beep(1319, .07, 'square', .05); setTimeout(() => beep(1760, .14, 'square', .05), 60);
  },
  smash() {
    try {
      drum(actx.currentTime, .18, .08, 2500);
      [0, 35, 70, 110].forEach(t => setTimeout(() => beep(500 + Math.random() * 900, .05, 'square', .035), t));
    } catch (e) { /* audio unavailable */ }
  },
  rumble() {
    try {
      [0, 90, 180, 270, 360].forEach(t => setTimeout(() => beep(60 + Math.random() * 25, .12, 'sawtooth', .07), t));
      drum(actx.currentTime, .3, .1, 400);
    } catch (e) { /* audio unavailable */ }
  },
  chestOpen() {
    // creaky hinge, then a sparkly rising arpeggio
    beep(140, .35, 'sawtooth', .05, 90);
    setTimeout(() => beep(170, .2, 'sawtooth', .04, -40), 200);
  },
  treasure() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => beep(f, .16, 'square', .06), 450 + i * 90));
  },
  heal() {
    [392, 523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, .2, 'sine', .1), 450 + i * 100));
  },
  stinger() {
    // "bom, bom, boooom": two short low hits, then a long dropping one
    const hit = (t, f, dur, vol) => setTimeout(() => {
      beep(f, dur, 'sawtooth', vol, -f * .12);
      beep(f / 2, dur, 'square', vol * .6, -f * .06);
    }, t);
    hit(0, 110, .18, .09); hit(200, 110, .18, .09); hit(400, 82, .9, .11);
    music.next = 0; music.hold = performance.now() + 1300;
  },
  step() {
    if (!actx || actx.state !== 'running') return;
    // short filtered noise tick, pitch varied so it sounds like boots on stone
    drum(actx.currentTime, .045, .035, 2500 + Math.random() * 1800);
    beep(180 + Math.random() * 40, .03, 'triangle', .015);
  },
  cry(spr) { (CRIES[spr] || CRIES.goblin)(); },
  hit() { beep(520, .08); setTimeout(() => beep(780, .15, 'square', .06, 200), 70); },
  miss() { beep(220, .35, 'sawtooth', .06, -140); },
  type() { beep(660, .03, 'square', .03); },
  win() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, .15), i * 110)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => setTimeout(() => beep(f, .25, 'triangle', .08), i * 180)); }
};

// ---------- music (chiptune sequencer) ----------
const NOISE_BUF = () => {
  if (NOISE_BUF.b) return NOISE_BUF.b;
  const b = actx.createBuffer(1, actx.sampleRate, actx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return NOISE_BUF.b = b;
};
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const TRACKS = {
  explore: {
    bpm: 132,
    bass: [45, 41, 43, 40, 45, 41, 40, 40],
    lead: [
      [76, 0, 72, 76, 81, 0, 79, 76], [77, 0, 72, 77, 81, 0, 79, 77],
      [79, 0, 74, 79, 83, 0, 81, 79], [76, 74, 71, 74, 76, 0, 0, 0],
      [81, 0, 76, 81, 84, 0, 83, 81], [81, 79, 77, 76, 77, 0, 72, 0],
      [80, 0, 76, 80, 83, 0, 80, 76], [71, 0, 74, 76, 80, 0, 0, 0]
    ]
  },
  battle: {
    bpm: 168,
    bass: [50, 46, 48, 45],
    lead: [
      [74, 77, 81, 77, 74, 77, 81, 84], [70, 74, 77, 74, 70, 74, 77, 82],
      [72, 76, 79, 76, 72, 76, 79, 84], [69, 73, 76, 73, 69, 73, 76, 81]
    ]
  }
};
const music = { track: null, bar: 0, step: 0, next: 0, muted: localStorage.getItem('spellingKnightMute') === '1' };

function note(type, midi, t, dur, vol) {
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.value = mtof(midi);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur + .02);
}
function drum(t, dur, vol, freq) {
  const s = actx.createBufferSource(); s.buffer = NOISE_BUF();
  const f = actx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = freq;
  const g = actx.createGain();
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(actx.destination); s.start(t); s.stop(t + dur);
}
function kick(t) {
  const o = actx.createOscillator(), g = actx.createGain();
  o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + .12);
  g.gain.setValueAtTime(.18, t); g.gain.exponentialRampToValueAtTime(0.0001, t + .14);
  o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + .16);
}
function playStep(tr, t, dur) {
  const root = tr.bass[Math.floor(music.bar / (tr.lead.length / tr.bass.length)) % tr.bass.length];
  const i = music.step;
  note('triangle', root + (i % 3 === 2 ? 12 : 0), t, dur * .9, .16);
  const m = tr.lead[music.bar][i];
  if (m) note('square', m, t, dur * .85, .04);
  if (i % 4 === 0) kick(t);
  if (i % 4 === 2) drum(t, .1, .08, 1500);
  else drum(t, .03, .02, 7000);
}
function musicTick() {
  if (!actx) return;
  const want = state === 'combat' ? 'battle' : (state === 'explore' || state === 'menu') ? 'explore' : null;
  if (music.muted || !want || actx.state !== 'running') { music.track = null; return; }
  if (want === 'battle' && music.hold && performance.now() < music.hold) { music.track = null; return; }
  if (music.track !== want) {
    music.track = want; music.bar = 0; music.step = 0; music.next = actx.currentTime + .05;
  }
  const tr = TRACKS[want], dur = 30 / tr.bpm;
  while (music.next < actx.currentTime + .25) {
    playStep(tr, music.next, dur);
    music.next += dur;
    if (++music.step >= 8) { music.step = 0; music.bar = (music.bar + 1) % tr.lead.length; }
  }
}
setInterval(musicTick, 80);
function unlockAudio() {
  actx = actx || new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
}
addEventListener('pointerdown', unlockAudio);
addEventListener('keydown', unlockAudio);
function toggleMute() {
  music.muted = !music.muted;
  localStorage.setItem('spellingKnightMute', music.muted ? '1' : '0');
  const b = document.getElementById('mute');
  b.textContent = music.muted ? '\u{1F507}' : '\u{1F3B5}'; b.blur();
}

function say(text) {
  if (!('speechSynthesis' in window)) return;
  if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
  if (!text) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.8; u.lang = 'en-US';
  const v = speechSynthesis.getVoices().find(v => /^en[-_]US/i.test(v.lang)) ||
            speechSynthesis.getVoices().find(v => /^en/i.test(v.lang));
  if (v) u.voice = v;
  speechSynthesis.resume();
  // Chrome can drop a speak() issued in the same tick as cancel()
  setTimeout(() => speechSynthesis.speak(u), 60);
}

// ---------- words ----------
let WORDS = window.WORD_BANKS;   // grade -> level -> [[word, sentence], ...]
let grade = 2;
const GRADES = [1, 2, 3, 4, 5];
const ordinal = g => ['', '1st', '2nd', '3rd', '4th', '5th'][g];
const bankNow = () => WORDS[grade] || WORDS[2];
async function loadWords() {
  // Backend hook: expects {grade: {level: [[word, sentence], ...]}}, same shape as WORD_BANKS.
  if (!location.protocol.startsWith('http')) return;
  try {
    const r = await fetch('/api/words');
    if (r.ok) WORDS = await r.json();
  } catch (e) { /* use local bank */ }
}

let bag = [];
function refillBag() {
  const bank = bankNow();
  const pool = [...(bank[level] || [])];
  if (!pool.length) pool.push(...Object.values(bank).flat());
  bag = pool.map(w => [Math.random(), w]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
}
function drawWord() {
  if (!bag.length) refillBag();
  return bag.shift();
}
// Cracked walls ask for one of the longest words from this level or the next.
function hardWord() {
  const bank = bankNow();
  const all = [...(bank[level] || []), ...(bank[level + 1] || [])];
  const top = all.sort((a, b) => b[0].length - a[0].length).slice(0, 8);
  return top[rnd(0, top.length - 1)];
}

// ---------- state ----------
const keys = {};
let state = 'title';          // title | explore | combat | over | win
let level = 1, maps = {}, cur = null, curKey = '', cleared = new Set(), roomState = new Map(), props = [], solid, door, player, enemies, target = null, combat = null, chest = null, campfire = null, slide = null, pushT = 0;
let message = { text: '', t: 0 };
let floaters = [];
let stats;
let time = 0;

const SAVE_KEY = 'spellingKnightSave';
function defaultSave() {
  return { gold: 0, owned: ['helmet:horned', 'color:blue', 'skin:plain'],
    look: { helmet: 'horned', color: 'blue', skin: 'plain' } };
}
function loadSave() {
  try {
    const m = document.cookie.match(new RegExp('(?:^|; )' + SAVE_KEY + '=([^;]*)'));
    const s = JSON.parse(m ? decodeURIComponent(m[1]) : localStorage.getItem(SAVE_KEY));
    if (s && Array.isArray(s.owned) && s.look && HELMETS[s.look.helmet] && COLORS[s.look.color] && SKINS[s.look.skin]) {
      s.gold = Number(s.gold) || 0;
      return s;
    }
  } catch (e) { /* fall through to a fresh save */ }
  return defaultSave();
}
// Saved to a cookie, with localStorage as a backup for pages (like file://) where cookies don't stick.
function persist() {
  const json = JSON.stringify(save);
  try { document.cookie = `${SAVE_KEY}=${encodeURIComponent(json)}; max-age=31536000; path=/; SameSite=Lax`; } catch (e) { /* cookies unavailable */ }
  try { localStorage.setItem(SAVE_KEY, json); } catch (e) { /* storage unavailable */ }
}
let save = loadSave();

// ---------- level maps ----------
// Each level is a 3x3 grid of rooms. A winding main path runs from the bottom row (entry) to the
// top row (exit), with a campfire in the middle. Side rooms are one-room dead ends (never deeper).
const GRID = 3;
const DIRS = {
  N: { dc: 0, dr: 1, from: 'S' }, S: { dc: 0, dr: -1, from: 'N' },
  E: { dc: 1, dr: 0, from: 'W' }, W: { dc: -1, dr: 0, from: 'E' }
};
const DOOR_TILES = { N: [[1, 9], [1, 10]], S: [[ROWS - 1, 9], [ROWS - 1, 10]], W: [[6, 0], [7, 0]], E: [[6, COLS - 1], [7, COLS - 1]] };
const DOOR_CENTERS = [[160, 24], [160, 184], [8, 112], [312, 112]];
const SPAWN = { S: [152, 140], N: [152, 38], W: [24, 100], E: [280, 100] };
const rkey = (l, rm) => `${l}:${rm.hidden ? rm.hidden + ':' : ''}${rm.c},${rm.r}`;
const PUSH = { E: [1, 0], W: [-1, 0], N: [0, -1], S: [0, 1] };

function genMap(lvl) {
  const list = LEVELS[lvl - 1].enemies;
  const maxLen = Math.min(5, list.length + 1);
  let path;
  do {
    let c = rnd(0, GRID - 1), r = 0, lastSide = false;
    path = [{ c, r }];
    while (r < GRID - 1) {
      const sides = [-1, 1].filter(d => c + d >= 0 && c + d < GRID);
      if (!lastSide && r > 0 && Math.random() < 0.5) { c += sides[rnd(0, sides.length - 1)]; lastSide = true; }
      else { r++; lastSide = false; }
      path.push({ c, r });
    }
  } while (path.length > maxLen);

  const cells = new Map();
  const mk = (c, r, kind) => {
    const o = { c, r, kind, doors: { N: false, E: false, S: false, W: false }, enemies: [] };
    cells.set(`${c},${r}`, o); return o;
  };
  const link = (a, b) => {
    const d = Object.keys(DIRS).find(k => DIRS[k].dc === b.c - a.c && DIRS[k].dr === b.r - a.r);
    a.doors[d] = true; b.doors[DIRS[d].from] = true;
  };
  const rooms = path.map(p => mk(p.c, p.r, 'path'));
  for (let i = 1; i < rooms.length; i++) link(rooms[i - 1], rooms[i]);
  const camp = rooms[Math.floor(rooms.length / 2)];
  camp.kind = 'camp';

  const fights = rooms.filter(rm => rm.kind === 'path');
  list.forEach((type, i) => fights[Math.floor(i * fights.length / list.length)].enemies.push(type));

  for (let want = rnd(1, 2), tries = 0; want > 0 && tries < 40; tries++) {
    const from = rooms[rnd(0, rooms.length - 1)], d = DIRS[Object.keys(DIRS)[rnd(0, 3)]];
    const c = from.c + d.dc, r = from.r + d.dr;
    if (c < 0 || r < 0 || c >= GRID || r >= GRID || cells.has(`${c},${r}`)) continue;
    link(from, mk(c, r, 'leaf')); want--;
  }
  if (Math.random() < 0.7) {
    const hosts = rooms.filter(rm => rm.kind !== 'camp');
    const host = hosts[rnd(0, hosts.length - 1)];
    const col = [4, 5, 6, 12, 14, 15][rnd(0, 5)];
    const room = { c: host.c, r: host.r, kind: 'leaf', hidden: 'secret', parent: host, enemies: [],
      doors: { N: false, E: false, S: true, W: false } };
    host.secret = { col, state: 'cracked', room };
  }
  if (Math.random() < 0.6) {
    const hosts = rooms.filter(rm => rm.kind !== 'camp');
    const host = hosts[rnd(0, hosts.length - 1)];
    const room = { c: host.c, r: host.r, kind: 'boss', hidden: 'boss', parent: host,
      enemies: [list[list.length - 1]], doors: { N: false, E: false, S: false, W: false } };
    host.stairs = { state: 'hidden', placed: false, room };
  }
  const entry = rooms[0], exit = rooms[rooms.length - 1];
  entry.doors.S = lvl > 1;
  exit.doors.N = true;
  return { cells, rooms: [...cells.values()], path: rooms, entry, exit, camp };
}
const getMap = l => maps[l] || (maps[l] = genMap(l));

function enterRoom(l, rm, from) {
  level = l; cur = rm; curKey = rkey(l, rm);
  buildLevel(from);
}
function go(dir) {
  if (cur.hidden === 'boss') return enterRoom(level, cur.parent, 'T');
  if (cur.hidden) return enterRoom(level, cur.parent, 'X');
  const m = getMap(level);
  if (dir === 'N' && cur === m.exit) return nextLevel();
  if (dir === 'S' && cur === m.entry) return prevLevel();
  const d = DIRS[dir];
  enterRoom(level, m.cells.get(`${cur.c + d.dc},${cur.r + d.dr}`), d.from);
}
function nextLevel() {
  if (level >= LAST_LEVEL) { endGame(true); return; }
  const m = getMap(level + 1);
  if (!cleared.has(rkey(level + 1, m.entry))) player.hp = Math.min(MAX_HP, player.hp + 1);
  bag = [];
  enterRoom(level + 1, m.entry, 'S');
}
function prevLevel() {
  bag = [];
  enterRoom(level - 1, getMap(level - 1).exit, 'N');
}
function openDoors() {
  door.open = true;
  for (const d in cur.doors) if (cur.doors[d]) for (const [r, c] of DOOR_TILES[d]) solid[r][c] = false;
}
const nearDoor = (c, r) => (c >= 8 && c <= 11 && r >= 7 && r <= 10) ||
  Object.keys(cur.doors).some(d => cur.doors[d] && DOOR_TILES[d].some(([tr, tc]) => Math.abs(tr - r) <= 3 && Math.abs(tc - c) <= 3));

function resetRun(lvl = 1, prog = null) {
  maps = {}; roomState = new Map(); cleared = new Set(); bag = [];
  flyers = []; sparks = []; pulses = [];
  stats = { correct: 0, quick: 0, gold: 0, missed: new Set() };
  player = { x: 152, y: 140, hp: prog ? Math.max(1, Math.min(MAX_HP, prog.hp | 0)) : MAX_HP,
    face: 1, moving: false, weapon: prog ? prog.weapon : 'sword' };
  // Everything before the starting point counts as already cleared.
  for (let l = 1; l < lvl; l++) for (const rm of getMap(l).rooms) cleared.add(rkey(l, rm));
  const m = getMap(lvl);
  if (prog && prog.stage === 1) {
    m.path.slice(0, m.path.indexOf(m.camp)).forEach(rm => cleared.add(rkey(lvl, rm)));
    enterRoom(lvl, m.camp, 'S');
  } else enterRoom(lvl, m.entry, 'S');
}

function isBlocked(x, y, w, h) {
  const x0 = Math.floor(x / T), x1 = Math.floor((x + w - 1) / T);
  const y0 = Math.floor(y / T), y1 = Math.floor((y + h - 1) / T);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS || solid[ty][tx]) return true;
  }
  return false;
}
const feetBlocked = (x, y) => isBlocked(x + 3, y + 8, 10, 7);
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function placeStairs(sp) {
  for (let tries = 0; tries < 200; tries++) {
    const c = rnd(4, 15), r = rnd(4, 9), d = Object.keys(PUSH)[rnd(0, 3)], [dx, dy] = PUSH[d];
    const dest = [c + dx, r + dy], stand = [c - dx, r - dy];
    const ok = ([tc, tr]) => tc >= 2 && tc <= 17 && tr >= 3 && tr <= 10 && !nearDoor(tc, tr) &&
      !(cur.secret && Math.abs(tc - cur.secret.col) <= 1 && tr <= 4);
    if (![[c, r], dest, stand].every(ok)) continue;
    Object.assign(sp, { placed: true, c, r, d, dest, stand });
    return;
  }
}

function buildLevel(from = 'S') {
  TH = TILESETS[level - 1];
  solid = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => r < 2 || r === ROWS - 1 || c === 0 || c === COLS - 1));
  door = { open: false };
  slide = null; pushT = 0;
  const camp = cur.kind === 'camp', leaf = cur.kind === 'leaf', boss = cur.kind === 'boss';
  for (let i = 0; i < (camp ? 2 : 3 + level); i++) {
    const c = rnd(3, 16), r = rnd(3, 9);
    if (nearDoor(c, r) || (camp && c >= 6 && c <= 13 && r >= 4 && r <= 9)) continue;
    if (cur.secret && Math.abs(c - cur.secret.col) <= 1 && r <= 4) continue;
    solid[r][c] = 'pillar';
  }
  if (cur.secret && cur.secret.state === 'open') solid[1][cur.secret.col] = false;
  const sp = cur.stairs;
  if (sp) {
    if (!sp.placed) placeStairs(sp);
    if (sp.placed) {
      solid[sp.stand[1]][sp.stand[0]] = false;
      solid[sp.dest[1]][sp.dest[0]] = sp.state === 'open' ? 'pillar' : false;
      solid[sp.r][sp.c] = sp.state === 'open' ? false : 'pillar';
    }
  }
  if (from === 'X') [player.x, player.y] = [cur.secret.col * T, 36];
  else if (from === 'T') [player.x, player.y] = [sp.stand[0] * T, sp.stand[1] * T - 4];
  else if (boss) [player.x, player.y] = [152, 110];
  else [player.x, player.y] = SPAWN[from];
  target = null; campfire = null; enemies = [];

  let st = roomState.get(curKey);
  const fresh = !st;
  if (fresh) roomState.set(curKey, st = { props: makeProps(), chest: null });
  props = st.props;
  chest = st.chest;
  if (leaf && fresh) spawnChest();

  const done = camp || leaf || !cur.enemies.length || cleared.has(curKey);
  if (done) openDoors();
  if (camp) campfire = { x: 10 * T, y: 7 * T + T / 2, near: false };
  if (!done) {
    for (const type of cur.enemies) {
      for (let tries = 0; tries < 200; tries++) {
        const x = rnd(24, 280), y = rnd(48, 160);
        if (feetBlocked(x, y)) continue;
        if (Math.hypot(x - player.x, y - player.y) < 90) continue;
        if (enemies.some(e => Math.hypot(e.x - x, e.y - y) < 36)) continue;
        const en = { type, ...ENEMY_TYPES[type], maxHp: ENEMY_TYPES[type].hp, x, y,
          dx: 0, dy: 0, timer: Math.random() * 2, bob: Math.random() * 6 };
        if (boss) {
          en.name = 'Big ' + en.name; en.scale = 3; en.gold *= 3;
          en.hp = en.maxHp = Math.min(7, en.hp + 2);
        }
        enemies.push(en);
        break;
      }
    }
  }
  if (camp) say_msg('A quiet room. Walk up to the fire!', 4);
  else if (boss) say_msg(done ? 'The hidden cellar' : 'A hidden cellar! A BIG monster!', 4);
  else if (leaf) say_msg(chest && chest.state === 'closed' ? 'A secret room! Open the chest!' : 'A secret room', 3);
  else if (cur === getMap(level).entry) say_msg(`Level ${level}: ${LEVELS[level - 1].name}`, 4);
  else if (!done) say_msg('Monsters ahead!', 3);
  if (cur.secret && cur.secret.state === 'cracked' && done) say_msg('That wall looks cracked...', 4);
}
function say_msg(text, t = 3) { message = { text, t }; }

// ---------- input ----------
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (state === 'combat') {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[a-z]$/.test(k)) typeLetter(k);
    else if (k === 'backspace') backspace();
    else if (k === 'enter') submit();
    else if (k === 'tab') hearWord();
    else return;
    e.preventDefault();
    return;
  }
  if (state === 'menu') { if (k === 'escape') closeWardrobe(); return; }
  if (k === 'm') { toggleMute(); return; }
  keys[k] = true;
  if (k.startsWith('arrow') || k === ' ') e.preventDefault();
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

function canvasPoint(e) {
  const r = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
}
const overAvatar = p => p.x >= AVATAR.x && p.x <= AVATAR.x + AVATAR.s && p.y >= AVATAR.y && p.y <= AVATAR.y + AVATAR.s;
cv.addEventListener('mousemove', e => { cv.style.cursor = state === 'explore' && overAvatar(canvasPoint(e)) ? 'pointer' : 'default'; });
cv.addEventListener('mousedown', e => {
  if (state !== 'explore') return;
  const p = canvasPoint(e);
  if (overAvatar(p)) { openWardrobe(); return; }
  target = p;
});

// ---------- wardrobe ----------
const wardrobe = document.getElementById('wardrobe');
const wGrid = document.getElementById('wGrid'), wTabs = document.getElementById('wTabs');
const wGold = document.getElementById('wGold'), wMsg = document.getElementById('wMsg');
const wPreview = document.getElementById('wPreview'), wpx = wPreview.getContext('2d');
const TABS = [['helmet', 'Helmets'], ['color', 'Armor'], ['skin', 'Skins']];
let wTab = 'helmet';
document.getElementById('wClose').onclick = () => closeWardrobe();

function openWardrobe() {
  for (const k in keys) keys[k] = false;
  target = null; state = 'menu'; wMsg.textContent = '';
  wardrobe.hidden = false; renderWardrobe();
}
function closeWardrobe() { wardrobe.hidden = true; state = 'explore'; }

function previewCanvas(look, size) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  g.drawImage(knightSprite(look, 'idle', 'normal'), (size - 18) / 2, (size - 18) / 2);
  return c;
}
function renderPreview() {
  wpx.imageSmoothingEnabled = false;
  wpx.clearRect(0, 0, 24, 24);
  wpx.drawImage(knightSprite(save.look, 'idle', 'normal'), 3, 3);
}
function renderWardrobe() {
  wGold.textContent = `${save.gold} G`;
  wTabs.innerHTML = '';
  for (const [id, label] of TABS) {
    const b = document.createElement('button');
    b.className = 'tab' + (id === wTab ? ' on' : ''); b.textContent = label;
    b.onclick = () => { wTab = id; wMsg.textContent = ''; renderWardrobe(); };
    wTabs.appendChild(b);
  }
  wGrid.innerHTML = '';
  for (const [id, item] of Object.entries(CATALOG[wTab])) {
    const owned = save.owned.includes(`${wTab}:${id}`);
    const on = save.look[wTab] === id;
    const card = document.createElement('button');
    card.className = 'card' + (on ? ' on' : '') + (!owned && save.gold < item.price ? ' poor' : '');
    card.appendChild(previewCanvas({ ...save.look, [wTab]: id }, 22));
    const n = document.createElement('div'); n.className = 'cname'; n.textContent = item.name;
    const s = document.createElement('div'); s.className = 'cstat';
    s.textContent = on ? 'WORN' : owned ? 'OWNED' : `${item.price} G`;
    card.append(n, s);
    card.onclick = () => pick(wTab, id);
    wGrid.appendChild(card);
  }
}
function pick(cat, id) {
  const item = CATALOG[cat][id], key = `${cat}:${id}`;
  if (!save.owned.includes(key)) {
    if (save.gold < item.price) {
      wMsg.textContent = `Need ${item.price - save.gold} more gold!`; sfx.miss(); return;
    }
    save.gold -= item.price; save.owned.push(key);
    wMsg.textContent = `Bought ${item.name}!`;
    beep(1568, .08); setTimeout(() => beep(2093, .2), 80);
  } else wMsg.textContent = '';
  save.look[cat] = id; persist(); renderWardrobe();
}

// ---------- explore ----------
let lastStep = -1, stuckT = 0;
function updateExplore(dt) {
  let dx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
  let dy = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
  if (dx || dy) target = null;
  else if (target) {
    const vx = target.x - (player.x + 8), vy = target.y - (player.y + 12), d = Math.hypot(vx, vy);
    if (d < 2) target = null; else { dx = vx / d; dy = vy / d; }
  }
  const len = Math.hypot(dx, dy) || 1;
  const walk = 62 * dt;
  const mx = dx / len * walk, my = dy / len * walk;
  const ox = player.x, oy = player.y;
  if (!feetBlocked(player.x + mx, player.y)) player.x += mx;
  if (!feetBlocked(player.x, player.y + my)) player.y += my;
  if (target) {
    // Sliding along an obstacle makes little real progress; give up after a moment.
    const moved = Math.hypot(player.x - ox, player.y - oy);
    stuckT = moved < walk * 0.5 ? stuckT + dt : 0;
    if (stuckT > 0.2 || moved === 0) { target = null; stuckT = 0; }
  } else stuckT = 0;
  player.moving = player.x !== ox || player.y !== oy;
  if (player.moving) {
    const s = Math.floor(time * 9);
    if (s !== lastStep) { lastStep = s; sfx.step(); }
  }
  if (dx) player.face = dx > 0 ? 1 : -1;

  for (const e of enemies) {
    if (e.wake > 0) {
      e.wake -= dt;
      if (e.wake <= 0) { startCombat(e); return; }
      continue;
    }
    e.timer -= dt;
    if (e.timer <= 0) {
      e.timer = 0.8 + Math.random() * 1.6;
      const a = Math.random() * Math.PI * 2, still = Math.random() < 0.3;
      e.dx = still ? 0 : Math.cos(a); e.dy = still ? 0 : Math.sin(a);
    }
    const spd = (e.fly ? 30 : 14) * dt;
    const nx = e.x + e.dx * spd, ny = e.y + e.dy * spd;
    if (!feetBlocked(nx, e.y)) e.x = nx; else e.dx = -e.dx;
    if (!feetBlocked(e.x, ny)) e.y = ny; else e.dy = -e.dy;
  }

  for (const e of enemies) {
    if (!e.wake && Math.hypot(e.x - player.x, e.y - player.y) < 13) { startCombat(e); return; }
  }
  const sp = cur.stairs;

  if (slide && (slide.t += dt) > 0.9) slide = null;
  if (sp && sp.placed && sp.state === 'hidden') {
    const [px, py] = PUSH[sp.d], fx = player.x + 8, fy = player.y + 12, len2 = Math.hypot(dx, dy) || 1;
    const main = px ? Math.floor(fx / T) === sp.stand[0] : Math.floor(fy / T) === sp.stand[1];
    const cross = px
      ? Math.min(player.y + 15, (sp.r + 1) * T) - Math.max(player.y + 8, sp.r * T)
      : Math.min(player.x + 13, (sp.c + 1) * T) - Math.max(player.x + 3, sp.c * T);
    if (main && cross >= 4 && (dx * px + dy * py) / len2 > 0.7) pushT += dt; else pushT = 0;
    if (pushT > 0.7) {
      pushT = 0; sp.state = 'open';
      solid[sp.r][sp.c] = false; solid[sp.dest[1]][sp.dest[0]] = 'pillar';
      slide = { t: 0 };
      sfx.rumble(); burst(sp.c * T + 8, sp.r * T + 12, ['#8a8fa8', '#5a5f79', '#c0cbdc'], 14);
      say_msg('Secret stairs revealed!', 4);
    }
  } else pushT = 0;
  if (sp && sp.state === 'open' && !slide && Math.floor((player.x + 8) / T) === sp.c &&
      Math.floor((player.y + 12) / T) === sp.r) { sfx.pickup(); enterRoom(level, sp.room, 'S'); return; }
  if (cur.hidden === 'boss' && player.y + 12 >= 10 * T && player.x + 8 > 9 * T && player.x + 8 < 11 * T) { go('S'); return; }

  const sc = cur.secret;
  if (sc && sc.state !== 'blocked' && Math.abs(player.x + 8 - (sc.col * T + 8)) < 8) {
    if (sc.state === 'cracked' && player.y < 26) { startCombat(wallEnemy(sc)); return; }
    if (sc.state === 'open' && player.y < 22) { enterRoom(level, sc.room, 'S'); return; }
  }

  if (door.open) {
    const cx = player.x + 8, cy = player.y + 12;
    if (cur.doors.N && player.y + 8 < 2 * T && cx > 9 * T && cx < 11 * T) go('N');
    else if (cur.doors.S && player.y + 12 > (ROWS - 1) * T && cx > 9 * T && cx < 11 * T) go('S');
    else if (cur.doors.W && cx < T && cy > 6 * T && cy < 8 * T) go('W');
    else if (cur.doors.E && cx > (COLS - 1) * T && cy > 6 * T && cy < 8 * T) go('E');
  }
  updateChest(dt);
  updateCampfire();
  updateProps();
  updateFx(dt);
  if (message.t > 0) message.t -= dt;
}

function makeProps() {
  const list = [], n = rnd(3, 5);
  for (let tries = 0; tries < 300 && list.length < n; tries++) {
    const x = rnd(24, 280), y = rnd(44, 160);
    if (isBlocked(x, y, 16, 16) || isBlocked(x - 2, y - 2, 20, 20)) continue;
    if (DOOR_CENTERS.some(([dx, dy]) => Math.hypot(x + 8 - dx, y + 8 - dy) < 44)) continue;
    if (cur.kind === 'camp' && Math.hypot(x - 160, y - 120) < 36) continue;
    if (cur.stairs && cur.stairs.placed && [[cur.stairs.c, cur.stairs.r], cur.stairs.dest, cur.stairs.stand]
      .some(([tc, tr]) => Math.hypot(x + 8 - (tc * T + 8), y + 8 - (tr * T + 8)) < 26)) continue;
    if (list.some(p => Math.hypot(p.x - x, p.y - y) < 24)) continue;
    const roll = Math.random();
    list.push({ x, y, kind: Math.random() < 0.5 ? 'pot' : 'crate',
      loot: roll < 0.15 ? 'potion' : roll < 0.5 ? 'gold' : null });
  }
  return list;
}
function updateProps() {
  for (const p of props) {
    if (p.broken || Math.hypot(p.x + 8 - (player.x + 8), p.y + 8 - (player.y + 12)) > 12) continue;
    p.broken = true;
    sfx.smash();
    burst(p.x + 8, p.y + 10, p.kind === 'pot' ? ['#c4683c', '#8a3f24', '#e8946a'] : ['#b8814a', '#6b4226', '#8a5a3c'], 12);
    if (p.loot === 'potion' && player.hp < MAX_HP) {
      flyItem('potion', null, p.x + 8, p.y + 4, () => applyReward({ kind: 'potion' }));
      say_msg('Health potion! +2 hearts', 3);
    } else if (p.loot) {
      const g = rnd(5, 10) * level;
      flyItem('gold', null, p.x + 8, p.y + 4, () => { save.gold += g; stats.gold += g; persist(); });
      say_msg(`+${g} gold!`, 2);
    }
  }
}
function drawProp(p) {
  if (p.broken) return;
  const spr = p.kind === 'pot' ? POT : CRATE;
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(p.x + 2, p.y + 14, 12, 2);
  ctx.drawImage(spr, Math.round(p.x + 8 - spr.width / 2), Math.round(p.y + 16 - spr.height));
}

// ---------- campfire ----------
function updateCampfire() {
  if (!campfire) return;
  const d = Math.hypot(player.x + 8 - campfire.x, player.y + 12 - campfire.y);
  if (d < 26 && !campfire.near) {
    campfire.near = true;
    player.hp = MAX_HP;
    save.progress = { grade, level, stage: 1, hp: player.hp, weapon: player.weapon }; persist();
    sfx.pickup(); say_msg('Rested and saved your game!', 3);
    burst(campfire.x, campfire.y - 6, ['#ffcd75', '#ef7d57', '#fff1b8']);
  } else if (d > 44) campfire.near = false;
}
function drawCampfire() {
  const { x, y } = campfire, f = Math.floor(time * 8) % 2;
  ctx.fillStyle = 'rgba(255,170,60,.12)'; ctx.beginPath(); ctx.arc(x, y - 2, 30, 0, 7); ctx.fill();
  ctx.fillStyle = '#5d275d'; ctx.fillRect(x - 7, y + 3, 14, 3);
  ctx.fillStyle = '#8a5a3c'; ctx.fillRect(x - 6, y + 2, 12, 3);
  ctx.fillStyle = '#b13e53'; ctx.fillRect(x - 4, y - 5 - f, 8, 8 + f);
  ctx.fillStyle = '#ef7d57'; ctx.fillRect(x - 3, y - 7 - f, 6, 8 + f);
  ctx.fillStyle = '#ffcd75'; ctx.fillRect(x - 2, y - 4, 4, 6 - f);
  ctx.fillStyle = '#fff1b8'; ctx.fillRect(x - 1, y - 1, 2, 3);
  txt('You can rest here', x, y - 22, '#ffcd75', 6, 'center');
}

// ---------- treasure chest ----------
function spawnChest() {
  chest = { x: 152, y: 100, state: 'closed', t: 0, reward: null };
  for (let tries = 0; tries < 200; tries++) {
    const x = rnd(100, 200), y = rnd(70, 130);
    if (isBlocked(x - 2, y - 2, 20, 18)) continue;
    chest = { x, y, state: 'closed', t: 0, reward: null };
    break;
  }
  const st = roomState.get(curKey);
  if (st) st.chest = chest;
}
function rollReward() {
  const upgrades = Object.keys(WEAPONS).filter(id => WEAPONS[id].bonus > WEAPONS[player.weapon].bonus);
  const hurt = player.hp < MAX_HP;
  let kind = Math.random() < 0.5 ? 'weapon' : 'potion';
  if (kind === 'weapon' && !upgrades.length) kind = hurt ? 'potion' : 'gold';
  if (kind === 'potion' && !hurt) kind = upgrades.length ? 'weapon' : 'gold';
  if (kind === 'weapon') return { kind, id: upgrades[rnd(0, upgrades.length - 1)] };
  return { kind };
}
function openChest() {
  if (!chest.safe && Math.random() < MIMIC_CHANCE) { spawnMimic(); return; }
  chest.state = 'opening'; chest.t = 0; chest.reward = rollReward(); chest.flown = false;
  sfx.chestOpen();
}
const MIMIC_CHANCE = 0.2;
function spawnMimic() {
  const { x, y } = chest;
  chest = null;
  const st = roomState.get(curKey); if (st) st.chest = null;
  enemies.push({ type: 'mimic', ...ENEMY_TYPES.mimic, maxHp: ENEMY_TYPES.mimic.hp, x, y, dx: 0, dy: 0,
    timer: 99, bob: 0, wake: 1.1, home: { x, y } });
  say_msg('OH NO a Mimic!', 2);
  sfx.pickup(); setTimeout(() => sfx.cry('mimic'), 150);
  burst(x + 8, y + 6, ['#ff3b3b', '#ffffff', '#ffcd75'], 14);
}
function mimicLoot(m) {
  chest = { x: m.x, y: m.y, state: 'opening', t: 0, reward: rollReward(), flown: false, safe: true };
  const st = roomState.get(curKey); if (st) st.chest = chest;
  sfx.chestOpen();
}
function rewardMessage(r) {
  if (r.kind === 'weapon') say_msg(`Found ${WEAPONS[r.id].name}! +${WEAPONS[r.id].bonus} damage`, 4);
  else if (r.kind === 'potion') say_msg('Health potion! +2 hearts', 4);
  else say_msg('A pile of gold! +20 gold', 4);
}
function applyReward(r) {
  if (r.kind === 'weapon') player.weapon = r.id;
  else if (r.kind === 'potion') player.hp = Math.min(MAX_HP, player.hp + 2);
  else { save.gold += 20; stats.gold += 20; persist(); }
}

// ---------- pickup effects ----------
let flyers = [], sparks = [], pulses = [];
function burst(x, y, colors, n = 14) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = 20 + Math.random() * 40;
    sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 10, t: 0, life: .4 + Math.random() * .3,
      c: colors[i % colors.length] });
  }
}
function pickupTarget(kind) {
  if (kind === 'weapon') return { x: AVATAR.x - AVATAR.s - 4 + AVATAR.s / 2, y: AVATAR.y + AVATAR.s / 2, slot: true };
  if (kind === 'potion') return { x: 4 + Math.max(0, player.hp) * 9 + 4, y: 8 };
  return { x: 8, y: 17 };
}
function flyItem(kind, id, x, y, onLand, delay = 0) {
  const to = pickupTarget(kind);
  flyers.push({ kind, id, x0: x, y0: y, x1: to.x, y1: to.y, slot: to.slot, t: -delay, dur: .55, onLand });
}
function updateFx(dt) {
  for (const f of flyers) {
    f.t += dt;
    if (f.t >= f.dur && !f.done) {
      f.done = true;
      if (f.onLand) f.onLand();
      burst(f.x1, f.y1, ['#ffe28a', '#ffffff', '#ffcd75'], 12);
      if (f.slot) pulses.push({ t: 0 });
      sfx.pickup();
    }
  }
  flyers = flyers.filter(f => !f.done);
  for (const s of sparks) { s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 80 * dt; }
  sparks = sparks.filter(s => s.t < s.life);
  for (const p of pulses) p.t += dt;
  pulses = pulses.filter(p => p.t < .5);
}
function drawFx() {
  for (const f of flyers) {
    if (f.t < 0) continue;
    const p = f.t / f.dur, e = p * p * (3 - 2 * p);
    const x = f.x0 + (f.x1 - f.x0) * e, y = f.y0 + (f.y1 - f.y0) * e - Math.sin(p * Math.PI) * 16;
    const spr = f.kind === 'weapon' ? WEAPONS[f.id].normal : f.kind === 'potion' ? POTION : COIN;
    ctx.save(); ctx.translate(Math.round(x), Math.round(y));
    if (f.kind === 'weapon') ctx.rotate(p * Math.PI / 4 + Math.PI * 2 * p);
    ctx.drawImage(spr, Math.round(-spr.width / 2), Math.round(-spr.height / 2));
    ctx.restore();
    ctx.fillStyle = 'rgba(255,226,138,.6)'; ctx.fillRect(Math.round(x - (f.x1 - f.x0) * .02), Math.round(y), 2, 2);
  }
  for (const s of sparks) {
    ctx.globalAlpha = 1 - s.t / s.life; ctx.fillStyle = s.c;
    ctx.fillRect(Math.round(s.x), Math.round(s.y), 2, 2);
  }
  ctx.globalAlpha = 1;
  for (const p of pulses) {
    const s = AVATAR.s, x = AVATAR.x - s - 4;
    ctx.globalAlpha = 1 - p.t / .5; ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, AVATAR.y, s, s); ctx.globalAlpha = 1;
  }
}
function updateChest(dt) {
  if (!chest) return;
  if (chest.state === 'closed') {
    if (Math.hypot(chest.x - player.x, chest.y - player.y) < 14) openChest();
  } else if (chest.state === 'opening') {
    chest.t += dt;
    if (chest.t >= 0.6) {
      chest.state = 'open'; chest.t = 0;
      const r = chest.reward;
      rewardMessage(r);
      if (r.kind === 'potion') sfx.heal(); else sfx.treasure();
    }
  } else if (chest.state === 'open') {
    chest.t += dt;
    if (chest.t >= 0.9 && !chest.flown) {
      chest.flown = true;
      const r = chest.reward;
      flyItem(r.kind, r.id, chest.x + 8, chest.y - 8, () => applyReward(r));
    }
  }
}
function drawChest() {
  const c = chest, sway = c.state === 'opening' ? Math.round(Math.sin(c.t * 60)) : 0;
  const bx = c.x + sway, by = c.y;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(bx, by + 14, 16, 2);
  if (c.state === 'closed') {
    const glow = 0.4 + 0.3 * Math.sin(time * 5);
    ctx.fillStyle = `rgba(255,226,138,${glow})`; ctx.fillRect(bx - 1, by + 5, 18, 10);
    for (let i = 0; i < 3; i++) {
      const p = (time * 1.2 + i / 3) % 1;
      ctx.fillStyle = '#ffe28a'; ctx.fillRect(Math.round(bx + 2 + i * 6), Math.round(by + 4 - p * 12), 2, 2);
    }
  }
  ctx.drawImage(c.state === 'closed' ? CHEST.closed : CHEST.open, bx, by + 4);
  if (c.state === 'open' && !c.flown && c.reward) {
    const r = c.reward, rise = Math.min(1, c.t / 0.5), yy = by - 6 - rise * 12 + Math.sin(time * 6) * 1.5;
    ctx.fillStyle = 'rgba(255,226,138,.35)'; ctx.fillRect(bx + 2, yy - 4, 12, 16);
    if (r.kind === 'weapon') {
      const spr = WEAPONS[r.id].normal;
      ctx.drawImage(spr, Math.round(bx + 8 - spr.width / 2), Math.round(yy + 4 - spr.height / 2));
    } else if (r.kind === 'potion') ctx.drawImage(POTION, Math.round(bx + 3.5), Math.round(yy - 1));
    else ctx.drawImage(COIN, Math.round(bx + 5.5), Math.round(yy + 2));
  }
}


// ---------- combat ----------
const panel = document.getElementById('panel');
const slotsEl = document.getElementById('slots');
const sentenceEl = document.getElementById('sentence');
const kbEl = document.getElementById('kb');
const timerFill = document.getElementById('timerFill');
const timerLabel = document.getElementById('timerLabel');

function buildKeyboard() {
  const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  rows.forEach((letters, i) => {
    const row = document.createElement('div'); row.className = 'row';
    [...letters].forEach(l => {
      const b = document.createElement('button'); b.className = 'key'; b.textContent = l;
      b.onclick = () => typeLetter(l); row.appendChild(b);
    });
    if (i === 2) {
      const bs = document.createElement('button'); bs.className = 'key wide'; bs.textContent = '\u232B';
      bs.onclick = backspace; row.appendChild(bs);
      const sw = document.createElement('button'); sw.className = 'key swing'; sw.textContent = '\u2694 Swing!';
      sw.onclick = submit; row.appendChild(sw);
    }
    kbEl.appendChild(row);
  });
}
buildKeyboard();
document.getElementById('hearWord').onclick = e => { e.currentTarget.blur(); hearWord(); };
document.getElementById('hearSentence').onclick = e => { e.currentTarget.blur(); hearSentence(); };

function hearWord() { if (combat) say(combat.word); }
function hearSentence() { if (combat) say(combat.sentence); }

function wallEnemy(sc) {
  return { type: 'wall', ...ENEMY_TYPES.wall, maxHp: 1, x: sc.col * T, y: 24, sc };
}
function startCombat(enemy) {
  state = 'combat'; target = null;
  combat = { enemy, word: '', sentence: '', typed: '', locked: true, anim: null, flash: 0 };
  panel.hidden = false;
  sfx.stinger();
  nextWord();
  floaters = [];
}

function nextWord() {
  const [word, sentence] = combat.enemy.wall ? hardWord() : drawWord();
  combat.word = word; combat.sentence = sentence; combat.typed = ''; combat.locked = false;
  combat.reveal = null;
  combat.timeMax = combat.timeLeft = 3 + 1.5 * word.length;
  sentenceEl.textContent = sentence.replace(new RegExp('\\b' + word + '\\b', 'i'), '_____');
  renderSlots();
  setTimeout(() => { if (combat && combat.word === word) say(word); }, 350);
}

function renderSlots() {
  slotsEl.innerHTML = '';
  const c = combat;
  for (let i = 0; i < c.word.length; i++) {
    const s = document.createElement('div'); s.className = 'slot';
    if (c.reveal) {
      s.textContent = c.word[i];
      s.classList.add(c.reveal === 'good' ? 'good' : 'reveal');
    } else s.textContent = c.typed[i] || '';
    slotsEl.appendChild(s);
  }
}

function typeLetter(l) {
  if (!combat || combat.locked || combat.typed.length >= combat.word.length) return;
  combat.typed += l; sfx.type(); renderSlots();
}
function backspace() {
  if (!combat || combat.locked) return;
  combat.typed = combat.typed.slice(0, -1); renderSlots();
}

function submit() {
  if (!combat || combat.locked || !combat.typed.length) return;
  const c = combat; c.locked = true;
  if (c.typed.toLowerCase() === c.word) {
    const quick = c.timeLeft > 0;
    stats.correct++; if (quick) stats.quick++;
    c.enemy.hp = Math.max(0, c.enemy.hp - (quick ? 2 : 1) - WEAPONS[player.weapon].bonus);
    c.reveal = 'good'; renderSlots();
    if (c.enemy.hp <= 0 && !c.enemy.wall) {
      const g = c.enemy.gold + rnd(0, 2);
      save.gold += g; stats.gold += g; persist();
      addFloater(`+${g} GOLD`, '#ffd23f', 'enemy', 0.5, 16);
      setTimeout(() => { beep(1568, .08); setTimeout(() => beep(2093, .2), 80); }, 500);
    }
    c.anim = { kind: 'hit', t: 0, dur: c.enemy.hp <= 0 ? 1.3 : 0.9 };
    sfx.attack();
    setTimeout(() => { sfx.hit(); if (c.enemy.wall) sfx.smash(); else sfx.cry(c.enemy.snd); }, 200);
    if (quick) { addFloater('QUICK! x2', '#7df9ff', 'enemy'); setTimeout(() => beep(1175, .2, 'square', .06), 150); }
    else addFloater('SLASH!', '#ffcd75', 'enemy');
  } else {
    stats.missed.add(c.word);
    if (!c.enemy.wall) {
      // Re-queue so the word comes back soon.
      bag.splice(Math.min(2, bag.length), 0, [c.word, c.sentence]);
      player.hp--;
    }
    c.reveal = 'show';
    renderSlots(); [...slotsEl.children].forEach(s => { s.classList.remove('reveal'); s.classList.add('wrong'); });
    c.anim = { kind: 'miss', t: 0, dur: c.enemy.wall ? 1.6 : 2.2 };
    sfx.miss(); addFloater(c.enemy.wall ? 'OH NO!' : 'MISS!', '#ff6b6b', 'knight');
  }
}

function finishAnim() {
  const c = combat, kind = c.anim.kind; c.anim = null;
  if (kind === 'miss') {
    if (c.enemy.wall) { wallDone(c.enemy.sc, false); return; }
    if (player.hp <= 0) { endGame(false); return; }
    nextWord();
  } else if (kind === 'hit') {
    if (c.enemy.hp <= 0) {
      c.anim = { kind: 'die', t: 0, dur: 0.7 };
      if (c.enemy.wall) sfx.smash(); else sfx.death(c.enemy.snd);
    } else nextWord();
  } else if (kind === 'die') {
    if (c.enemy.wall) { wallDone(c.enemy.sc, true); return; }
    const ex = c.enemy.x + 8, ey = c.enemy.y;
    for (let i = 0; i < 3; i++) flyItem('gold', null, ex + (i - 1) * 6, ey, null, i * 0.12);
    enemies = enemies.filter(e => e !== c.enemy);
    combat = null; panel.hidden = true; state = 'explore';
    if (c.enemy.mimic) { mimicLoot(c.enemy); say_msg('The Mimic is defeated! Take the loot!', 4); sfx.win(); }
    else if (!enemies.length) {
      cleared.add(curKey); openDoors(); spawnChest();
      say_msg('A chest appeared! The doors are open!', 5); sfx.win();
    } else say_msg(`${enemies.length} monster${enemies.length > 1 ? 's' : ''} left`, 2);
  }
}

function wallDone(sc, broke) {
  combat = null; panel.hidden = true; state = 'explore';
  sc.state = broke ? 'open' : 'blocked';
  if (broke) solid[1][sc.col] = false;
  burst(sc.col * T + 8, 28, ['#7a7f99', '#5a5f79', '#c0cbdc'], 16);
  sfx.smash();
  say_msg(broke ? 'The wall broke open! A secret room!' : 'The wall crumbled... it is blocked now.', 4);
  if (broke) sfx.win();
}

function addFloater(s, color, who, delay = 0, dy = 0) { floaters.push({ s, color, who, t: -delay, dy }); }

// ---------- overlay ----------
const overlay = document.getElementById('overlay');
const ovTitle = document.getElementById('ovTitle'), ovBody = document.getElementById('ovBody');
const ovMenu = document.getElementById('ovMenu');
// items: [{label, fn, disabled, back}]; the overlay closes before fn runs unless fn returns false.
function showMenu(title, body, items) {
  ovTitle.textContent = title; ovBody.innerHTML = body; ovMenu.innerHTML = '';
  for (const it of items) {
    const b = document.createElement('button');
    b.className = 'btn' + (it.back ? ' back' : ''); b.textContent = it.label; b.disabled = !!it.disabled;
    b.onclick = () => { b.blur(); if (it.fn() !== false) overlay.hidden = true; };
    ovMenu.appendChild(b);
  }
  overlay.hidden = false;
}
function startGame(lvl = 1, prog = null, g = null) {
  if (g) grade = g;
  say(''); resetRun(lvl, prog); state = 'explore'; panel.hidden = true; combat = null;
}
function savedProgress() {
  const p = save.progress;
  if (!p || !(p.level >= 1 && p.level <= LAST_LEVEL) || !WEAPONS[p.weapon]) return null;
  return { ...p, grade: GRADES.includes(p.grade) ? p.grade : 2 };
}
const HOW_TO = 'Walk with <b>W A S D</b> (or arrows) or <b>click</b> where to go.<br>' +
  'Touch a monster to fight!<br>' +
  'Listen to the word, then <b>type</b> it (or click the letters) and press <b>Enter</b> to swing your sword.<br>' +
  'Spell it wrong and you miss &mdash; the monster hits you!<br>' +
  '<b>Tab</b> repeats the word.<br>Spell it before the <b>timer</b> runs out for double damage!';
function showSplash() {
  state = 'title';
  showMenu('Spelling Knight', '<span class="blink">Press any button to continue</span>', []);
  const go = e => {
    if (e.type === 'keydown' && ['shift', 'control', 'alt', 'meta'].includes(e.key.toLowerCase())) return;
    removeEventListener('keydown', go); removeEventListener('pointerdown', go);
    showMainMenu();
  };
  setTimeout(() => { addEventListener('keydown', go); addEventListener('pointerdown', go); }, 150);
}
function showMainMenu() {
  const p = savedProgress();
  showMenu('Spelling Knight', '', [
    { label: 'Start New', fn: () => showGradeSelect(g => { delete save.progress; persist(); return startGame(1, null, g); }) },
    { label: 'Select Level', fn: () => showGradeSelect(showLevelSelect) },
    { label: p ? `Load Save (${ordinal(p.grade)} Grade, Level ${p.level})` : 'Load Save', disabled: !p, fn: () => startGame(p.level, p, p.grade) },
    { label: 'How to Play', fn: showHowTo },
  ]);
}
function showGradeSelect(next) {
  showMenu('Pick a Grade', 'Each grade has its own words.', [
    ...GRADES.map(g => ({ label: `${ordinal(g)} Grade${g === grade ? '  \u2605' : ''}`,
      fn: () => { grade = g; return next(g); } })),
    { label: 'Back', back: true, fn: () => { showMainMenu(); return false; } },
  ]);
  return false;
}
function showLevelSelect(g) {
  showMenu(`${ordinal(g)} Grade: Select Level`, '', [
    ...LEVELS.map((L, i) => ({ label: `${i + 1}. ${L.name}`, fn: () => startGame(i + 1, null, g) })),
    { label: 'Back', back: true, fn: () => { showGradeSelect(showLevelSelect); return false; } },
  ]);
  return false;
}
function showHowTo() {
  showMenu('How to Play', HOW_TO, [{ label: 'Back', back: true, fn: () => { showMainMenu(); return false; } }]);
  return false;
}
function endGame(won) {
  panel.hidden = true; combat = null; state = won ? 'win' : 'over';
  const missed = [...stats.missed];
  const body = `Words spelled right: <b>${stats.correct}</b> (quick bonuses: <b>${stats.quick}</b>)<br>` +
    `Gold earned: <b>${stats.gold}</b> (total ${save.gold})<br>` +
    (missed.length ? `Words to practice: <b>${missed.join(', ')}</b>` : '<b>You never missed a word!</b>');
  won ? sfx.win() : sfx.lose();
  if (won) { delete save.progress; persist(); }
  const p = won ? null : savedProgress();
  showMenu(won ? 'You Win!' : 'Defeated!', body, [
    { label: won ? 'Play again' : p ? `Last campfire (Level ${p.level})` : 'Try again',
      fn: () => startGame(p ? p.level : won ? 1 : level, p, p ? p.grade : grade) },
    { label: 'Main Menu', back: true, fn: () => { showMainMenu(); return false; } },
  ]);
}

// ---------- drawing ----------
function txt(s, x, y, color = '#fff', size = 8, align = 'left') {
  ctx.font = `${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'top';
  ctx.fillStyle = '#1a1c2c'; ctx.fillText(s, x + 1, y + 1);
  ctx.fillStyle = color; ctx.fillText(s, x, y);
}
function spriteAt(img, cx, feetY, scale = 1, flip = false) {
  const w = img.width * scale, h = img.height * scale;
  ctx.save();
  ctx.translate(Math.round(cx), Math.round(feetY - h));
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -Math.round(w / 2), 0, w, h);
  ctx.restore();
}

function drawHearts(x, y, n, max, sprite = 'heart') {
  for (let i = 0; i < max; i++) ctx.drawImage(i < n ? S[sprite] : S.heartEmpty, x + i * 9, y);
}

// Top-right HUD: gold counter, equipped-weapon slot and avatar button.
const AVATAR = { x: W - 26, y: 3, s: 22 };
function slotBox(x, y, s) {
  ctx.fillStyle = '#1a1c2c'; ctx.fillRect(x - 1, y - 1, s + 2, s + 2);
  ctx.fillStyle = '#ffcd75'; ctx.fillRect(x, y, s, s);
  ctx.fillStyle = '#333c57'; ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
}
function drawInventory() {
  ctx.drawImage(COIN, 4, 13);
  txt(String(save.gold), 12, 13, '#ffd23f', 8);

  const s = AVATAR.s, x = AVATAR.x - s - 4, y = AVATAR.y;
  slotBox(x, y, s);
  const spr = WEAPONS[player.weapon].normal;
  ctx.save();
  ctx.translate(x + s / 2, y + s / 2);
  ctx.rotate(Math.PI / 4);
  ctx.drawImage(spr, -spr.width / 2, -spr.height / 2);
  ctx.restore();

  slotBox(AVATAR.x, AVATAR.y, s);
  ctx.drawImage(knightSprite(save.look, 'idle', 'normal'), 0, 0, 18, 12, AVATAR.x + 2, AVATAR.y + 5, 18, 12);
}

function drawTorch(x, y) {
  ctx.fillStyle = '#5d275d'; ctx.fillRect(x, y + 4, 2, 6);
  const f = Math.floor(time * 8) % 2;
  ctx.fillStyle = TH.flame[0]; ctx.fillRect(x - 1, y - 2 + f, 4, 6 - f);
  ctx.fillStyle = TH.flame[1]; ctx.fillRect(x, y + f, 2, 3);
}

function drawDoor(dir) {
  const [[r, c]] = DOOR_TILES[dir], horiz = dir === 'N' || dir === 'S';
  const x = c * T, y = r * T, w = horiz ? 2 * T : T, h = horiz ? T : 2 * T;
  ctx.fillStyle = door.open ? '#0d0e17' : '#6b4226'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = door.open ? '#ffcd75' : '#8a5a3c';
  ctx.fillRect(x - 2, y - 2, w + 4, 2); ctx.fillRect(x - 2, y + h, w + 4, 2);
  ctx.fillRect(x - 2, y - 2, 2, h + 4); ctx.fillRect(x + w, y - 2, 2, h + 4);
  if (!door.open) { ctx.fillStyle = '#ffcd75'; ctx.fillRect(x + w / 2 - 1, y + h / 2 - 1, 2, 3); }
}

function drawSecret(sc) {
  const x = sc.col * T;
  const px = (dx, dy, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + dx, dy, w, h); };
  if (sc.state === 'cracked') {
    const zig = [[7, 0], [8, 4], [6, 8], [8, 12], [7, 16], [9, 20], [7, 24], [8, 28]];
    for (const [dx, dy] of zig) { px(dx, dy, 2, 5, '#0d0e17'); px(dx + 2, dy, 1, 5, '#8a8fa8'); }
    if (Math.sin(time * 4) > 0.3) px(5, 12, 1, 1, '#ffcd75');
  } else {
    if (sc.state === 'open') px(0, T, T, T, '#0d0e17');
    else for (const [dx, dy] of [[7, 0], [8, 4], [6, 8], [8, 12]]) px(dx, dy, 2, 5, '#0d0e17');
    for (const [dx, w, c] of [[1, 4, '#7a7f99'], [5, 3, '#5a5f79'], [9, 5, '#7a7f99'], [12, 3, '#5a5f79']]) px(dx, 2 * T - 3, w, 3, c);
  }
}

function drawStairs(x, y, w, h, up) {
  ctx.fillStyle = '#0d0e17'; ctx.fillRect(x, y, w, h);
  const n = 4;
  for (let i = 0; i < n; i++) {
    const sh = up ? i : n - 1 - i;
    ctx.fillStyle = `rgb(${50 + sh * 28},${54 + sh * 28},${74 + sh * 28})`;
    ctx.fillRect(x + 1, y + 1 + i * Math.floor((h - 2) / n), w - 2, Math.floor((h - 2) / n) - 1);
  }
}

function drawRoom() {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const v = solid[r][c];
    if (r < 2 || c === 0 || c === COLS - 1 || r === ROWS - 1) {
      if (!v) { ctx.fillStyle = '#0d0e17'; ctx.fillRect(c * T, r * T, T, T); }
      else ctx.drawImage(TH.WALL, c * T, r * T);
    } else if (v === 'pillar') {
      const sp = cur.stairs;
      if (slide && sp && c === sp.dest[0] && r === sp.dest[1]) ctx.drawImage(TH.FLOOR[0], c * T, r * T);
      else if (pushT > 0 && sp && c === sp.c && r === sp.r) ctx.drawImage(TH.PILLAR, c * T + (Math.floor(time * 30) % 2 ? 1 : -1), r * T);
      else ctx.drawImage(TH.PILLAR, c * T, r * T);
    }
    else ctx.drawImage(TH.FLOOR[(c * 7 + r * 3) % 5 === 0 ? 1 : 0], c * T, r * T);
  }
  const sp = cur.stairs;
  if (sp && sp.placed) {
    if (sp.state === 'open') drawStairs(sp.c * T, sp.r * T, T, T, false);
    else {
      // faint scuff marks on the floor show which way the pillar will slide
      const [dx, dy] = sp.dest, x = dx * T, y = dy * T;
      ctx.fillStyle = 'rgba(13,14,23,.35)';
      ctx.fillRect(x + 3, y + 5, 6, 1); ctx.fillRect(x + 8, y + 10, 5, 1); ctx.fillRect(x + 4, y + 13, 4, 1);
      if (Math.sin(time * 2.5) > 0.9) { ctx.fillStyle = '#fff'; ctx.fillRect(sp.c * T + 5, sp.r * T + 4, 1, 1); }
    }
    if (slide) {
      const k = Math.min(1, slide.t / 0.4), [px, py] = PUSH[sp.d];
      ctx.drawImage(TH.PILLAR, Math.round((sp.c + px * k) * T), Math.round((sp.r + py * k) * T));
    }
  }
  if (cur.hidden === 'boss') drawStairs(9 * T, 10 * T, 2 * T, T, true);
  if (cur.secret) drawSecret(cur.secret);
  for (const d in cur.doors) if (cur.doors[d]) drawDoor(d);
  drawTorch(3 * T, 18); drawTorch(16 * T, 18); drawTorch(7 * T, 18); drawTorch(13 * T, 18);
}

function drawExplore() {
  drawRoom();
  const items = enemies.map(e => ({ y: e.y, draw() {
    const bob = Math.round(Math.sin(time * 4 + e.bob)) - (e.wake > 0 ? Math.round(Math.abs(Math.sin(time * 14)) * 5) : 0);
    spriteAt(S[e.spr], e.x + 8, e.y + 16 + (e.fly ? bob * 2 - 4 : 0) + (e.wake > 0 ? bob : 0), e.spr === 'king' ? 1.5 : 1);
    if (e.maxHp > 1) drawHearts(e.x + 8 - (e.maxHp * 9) / 2 + 1, e.y - 8, e.hp, e.maxHp);
  } }));
  if (chest) items.push({ y: chest.y + 10, draw: drawChest });
  for (const p of props) items.push({ y: p.y + 14, draw: () => drawProp(p) });
  if (campfire) items.push({ y: campfire.y + 6, draw: drawCampfire });
  items.push({ y: player.y, draw() {
    const bob = player.moving ? Math.round(Math.abs(Math.sin(time * 14))) : Math.round(Math.sin(time * 3) * 0.5 + 0.5);
    const frame = player.moving ? WALK[Math.floor(time * 9) % 4] : 'idle';
    const lift = player.moving && frame === 'b' ? 1 : 0;
    drawKnight(player.x + 8, player.y + 16 - lift, 1, player.face < 0, frame, player.moving ? 0.5 : 0.35);
  } });
  items.sort((a, b) => a.y - b.y).forEach(i => i.draw());
  if (target) { ctx.fillStyle = '#ffcd75'; ctx.fillRect(Math.round(target.x) - 1, Math.round(target.y) - 1, 3, 3); }
  drawHearts(4, 4, player.hp, MAX_HP);
  txt(`${ordinal(grade).toUpperCase()} GRADE  LEVEL ${level}/${LAST_LEVEL}`, W - 58, 10, '#ffcd75', 8, 'right');
  drawInventory();
  drawFx();
  if (message.t > 0) txt(message.text, W / 2, 24, '#fff', 8, 'center');
}

function drawCombat(dt) {
  const c = combat, e = c.enemy;
  if (!c.locked && c.timeLeft > 0) c.timeLeft = Math.max(0, c.timeLeft - dt);
  const frac = c.locked && !c.anim ? 0 : c.timeLeft / c.timeMax;
  timerFill.style.width = (frac * 100) + '%';
  timerFill.className = frac <= 0 ? 'out' : frac < 0.3 ? 'low' : '';
  timerLabel.textContent = c.timeLeft > 0 ? 'QUICK BONUS: DOUBLE DAMAGE!' : 'Too slow - normal hit';
  for (let r = 0; r < 7; r++) for (let col = 0; col < COLS; col++) {
    if (r < 5) ctx.drawImage(TH.WALL, col * T, r * T);
    else ctx.drawImage(TH.FLOOR[(col + r) % 4 === 0 ? 1 : 0], col * T, r * T);
  }
  ctx.fillStyle = TH.dim; ctx.fillRect(0, 0, W, 80);
  drawTorch(60, 30); drawTorch(260, 30); drawTorch(160, 22);

  const feetY = 100, kx0 = 60, ex0 = 245;
  let kx = kx0, ex = ex0, kVar = 'normal', kAng = 0.35, eImg = S[e.spr], ealpha = 1, ey = feetY, slash = 0, shake = 0;
  const a = c.anim;
  if (a) {
    a.t += dt;
    if (a.kind === 'hit') {
      const p = Math.min(1, a.t / 0.35);
      kx = kx0 + Math.sin(p * Math.PI) * 120;
      kAng = a.t < 0.2 ? -0.9 + 2.9 * (a.t / 0.2) : 2.0 - Math.min(1, (a.t - 0.2) / 0.4) * 1.65;
      if (a.t > 0.17 && a.t < 0.55) { eImg = WHITE[e.spr]; shake = Math.round(Math.sin(a.t * 80) * 3); slash = a.t - 0.17; }
    } else if (a.kind === 'miss') {
      const p = Math.min(1, a.t / 0.5);
      ex = e.wall ? ex0 : ex0 - Math.sin(p * Math.PI) * 150;
      if (!e.wall && a.t > 0.25 && a.t < 0.7) { kVar = 'red'; kAng = 1.0; kx += Math.round(Math.sin(a.t * 80) * 3); }
    } else if (a.kind === 'die') {
      ealpha = 1 - a.t / a.dur; ey += a.t * 14;
      if (Math.floor(a.t * 20) % 2) eImg = WHITE[e.spr];
    }
    if (a.t >= a.dur) finishAnim();
  }
  const idle = Math.round(Math.sin(time * 3) * 0.5 + 0.5);
  const es = e.scale;
  drawKnight(kx, feetY - idle, 2, false, a && a.kind === 'hit' ? WALK[Math.floor(a.t * 14) % 4] : 'idle', kAng, kVar);
  ctx.globalAlpha = Math.max(0, ealpha);
  spriteAt(eImg, ex + shake, ey - (e.fly ? 8 : 0) - idle, es, true);
  ctx.globalAlpha = 1;
  if (slash > 0) {
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 14; i++) ctx.fillRect(ex - 28 + i * 3, 36 + i * 3, 4, 4);
  }
  drawHearts(4, 4, player.hp, MAX_HP);
  drawInventory();
  txt(e.name.toUpperCase(), ex0, 4, '#fff', 8, 'center');
  drawHearts(ex0 - (e.maxHp * 9) / 2 + 1, 15, Math.max(0, e.hp), e.maxHp);

  floaters.forEach(f => {
    f.t += dt;
    if (f.t < 0) return;
    const fx = f.who === 'enemy' ? ex0 : kx0, fy = 40 + f.dy - f.t * 18;
    ctx.globalAlpha = Math.max(0, 1 - f.t / 1.4);
    txt(f.s, fx, fy, f.color, 10, 'center');
    ctx.globalAlpha = 1;
  });
  floaters = floaters.filter(f => f.t < 1.4);
}

// ---------- main loop ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;
  ctx.fillStyle = '#0d0e17'; ctx.fillRect(0, 0, W, H);
  if (state === 'explore') { updateExplore(dt); if (state === 'explore') drawExplore(); }
  if (state === 'combat') drawCombat(dt);
  if (state === 'menu') { drawExplore(); renderPreview(); }
  if (state === 'over' || state === 'win') { if (combat === null && enemies) drawExplore(); }
  if (state === 'title') { buildTitleBackdrop(); }
  requestAnimationFrame(frame);
}
function buildTitleBackdrop() {
  if (!solid) resetRun();
  drawExplore();
}

// ---------- boot ----------
loadWords();




document.getElementById('mute').textContent = music.muted ? '\u{1F507}' : '\u{1F3B5}';
document.getElementById('mute').onclick = toggleMute;
resetRun();
showSplash();
requestAnimationFrame(frame);
})();
