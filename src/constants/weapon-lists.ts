// Auto-generated weapon lists from COD Mobile weapons database
// Organized by category with banned weapons filtered out

const BANNED_GUNS = ['NA-45', 'SVD', 'XPR-50', 'Argus', 'Shorty', 'XPR', 'Thumper', 'SMRS', 'FHJ-18', 'D13 Sector'];

// Function to clean weapon names (remove season info)
function cleanWeaponName(name: string): string {
  return name.replace(/\s*\([^)]*\)/g, '').trim();
}

// Parse weapons from raw data
const RAW_WEAPONS = {
  'Assault Rifles': 'M4 · AK117 · AK-47 · Type 25 · ASM10 · BK57 · LK24 · M16 · ICR-1 (Season 2) · Man-O-War (Season 2) · HBRa3 (Season 3) · KN-44 (Season 4) · HVK-30 (Season 5) · DR-H (Season 8) · Peacekeeper MK2 (Season 13) · FR .556 (2021 Season 1) · AS VAL (2021 Season 2) · CR-56 AMAX (2021 Season 5) · M13 (2021 Season 8) · Swordfish (2021 Season 9) · Kilo 141 (2022 Season 1) · Oden (2022 Season 5) · Krig 6 (2022 Season 9) · EM2 (2022 Season 11) · Maddox (2023 Season 2) · FFAR 1 (2023 Season 5) · Grau 5.56 (2023 Season 6) · Groza (2023 Season 11) · Type 19 (2024 Season 2) · BP50 (2024 Season 6) · LAG 53 (2024 Season 8) · XM4 (2025 Season 1) · Vargo-S (2025 Season 4) · RAM-7 (2025 Season 8)',
  'Sniper Rifles': 'DL Q33 · M21 EBR · Arctic .50 · XPR-50 · Locus (Season 2) · Outlaw (Season 6) · NA-45 (Season 11) · Rytec AMR (2021 Season 6) · SVD (2021 Season 10) · Koshka (2022 Season 4) · ZRG 20mm (2022 Season 8) · HDR (2023 Season 3) · LW3-Tundra (2024 Season 1) · 3-Line Rifle (2025 Season 6)',
  'Light Machine Guns': 'RPD · M4LMG · UL736 · S36 · Chopper (Season 7) · Holger 26 (2021 Season 4) · Hades (2021 Season 7) · PKM (2021 Season 11) · Dingo (2023 Season 1) · Bruen MK9 (2023 Season 10) · MG42 (2024 Season 4) · RAAL MG (2024 Season 11) · MG 82 (2025 Season 7)',
  'Submachine Guns': 'RUS-79U · PDW-57 · HG 40 · Chicom · MSMC · Razorback (Season 2) · Pharo (Season 2) · GKS (Season 5) · Cordite (Season 6) · QQ9 (Season 7) · Fennec (Season 11) · AGR 556 (Season 12) · QXR (Season 13) · PP19 Bizon (2021 Season 3) · MX9 (2021 Season 6) · CBR4 (2021 Season 10) · PPSh-41 (2022 Season 1) · MAC-10 (2022 Season 3) · KSP 45 (2022 Season 6) · Switchblade X9 (2022 Season 7) · LAPA (2022 Season 10) · OTs 9 (2023 Season 4) · Striker 45 (2023 Season 7) · CX-9 (2023 Season 9) · TEC-9 (2024 Season 3) · ISO (2024 Season 7) · USS 9 (2024 Season 10) · VMP (2025 Season 5) · Sten (2025 Season 9)',
  'Shotguns': 'BY15 · Striker · HS2126 · HS0405 · KRM-262 (Season 3) · Echo (Season 10) · R9-0 (2021 Season 8) · JAK-12 (2022 Season 2) · Argus (2023 Season 8) · VLK Rogue (2025 Season 2) · Einhorn Revolving (2025 Season 10)',
  'Marksman Rifles': 'Kilo Bolt-Action (Season 9) · SKS (2021 Season 1) · SP-R 208 (2021 Season 2) · MK2 (2021 Season 4) · Type 63 (2024 Season 9) · M1 Garand (2025 Season 3) · SO-14 (2025 Season 11)',
  'Pistols': 'MW11 · J358 · .50 GS (Season 12) · Renetti (2021 Season 3) · Shorty (2021 Season 5) · Crossbow (2021 Season 7) · L-CAR 9 (2022 Season 6) · Dobvra (2023 Season 4) · Nail Gun (2023 Season 10) · Machine Pistol (2024 Season 5)'
};

// Parse and filter weapons by category
function parseWeapons(rawString: string): string[] {
  return rawString
    .split('·')
    .map(w => cleanWeaponName(w))
    .filter(w => w.length > 0 && !BANNED_GUNS.includes(w));
}

// Split weapons into chunks of 24
function chunkWeapons(weapons: string[], chunkSize: number = 24): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < weapons.length; i += chunkSize) {
    chunks.push(weapons.slice(i, i + chunkSize));
  }
  return chunks;
}

// Generate weapon lists for each category
const AR_WEAPONS = parseWeapons(RAW_WEAPONS['Assault Rifles']);
const SNIPER_WEAPONS = parseWeapons(RAW_WEAPONS['Sniper Rifles']);
const LMG_WEAPONS = parseWeapons(RAW_WEAPONS['Light Machine Guns']);
const SMG_WEAPONS = parseWeapons(RAW_WEAPONS['Submachine Guns']);
const SHOTGUN_WEAPONS = parseWeapons(RAW_WEAPONS['Shotguns']);
const MARKSMAN_WEAPONS = parseWeapons(RAW_WEAPONS['Marksman Rifles']);
const PISTOL_WEAPONS = parseWeapons(RAW_WEAPONS['Pistols']);

// Create chunked lists
export const WEAPON_LISTS_BY_CATEGORY = {
  AR: chunkWeapons(AR_WEAPONS).map(chunk => chunk.join(', ')),
  SMG: chunkWeapons(SMG_WEAPONS).map(chunk => chunk.join(', ')),
  SNIPER: chunkWeapons(SNIPER_WEAPONS).map(chunk => chunk.join(', ')),
  LMG: chunkWeapons(LMG_WEAPONS).map(chunk => chunk.join(', ')),
  SHOTGUN: chunkWeapons(SHOTGUN_WEAPONS).map(chunk => chunk.join(', ')),
  MARKSMAN: chunkWeapons(MARKSMAN_WEAPONS).map(chunk => chunk.join(', ')),
  PISTOL: chunkWeapons(PISTOL_WEAPONS).map(chunk => chunk.join(', ')),
  HEAVY: [
    ...chunkWeapons(LMG_WEAPONS).map(chunk => chunk.join(', ')),
    ...chunkWeapons(SHOTGUN_WEAPONS).map(chunk => chunk.join(', '))
  ]
};

// Category mapping
export const CATEGORY_MAPPING = {
  'AR': 'AR',
  'Assault Rifle': 'AR',
  'Assault Rifles': 'AR',
  'SMG': 'SMG',
  'Submachine Gun': 'SMG',
  'Submachine Guns': 'SMG',
  'SNIPER': 'SNIPER',
  'Sniper': 'SNIPER',
  'Sniper Rifle': 'SNIPER',
  'Sniper Rifles': 'SNIPER',
  'LMG': 'LMG',
  'Light Machine Gun': 'LMG',
  'Light Machine Guns': 'LMG',
  'SHOTGUN': 'SHOTGUN',
  'Shotgun': 'SHOTGUN',
  'Shotguns': 'SHOTGUN',
  'MARKSMAN': 'MARKSMAN',
  'Marksman': 'MARKSMAN',
  'Marksman Rifle': 'MARKSMAN',
  'Marksman Rifles': 'MARKSMAN',
  'PISTOL': 'PISTOL',
  'Pistol': 'PISTOL',
  'Pistols': 'PISTOL',
  'HEAVY': 'HEAVY',
  'Heavy': 'HEAVY'
};

export function getWeaponListsForCategory(category: string): string[] {
  const normalized = CATEGORY_MAPPING[category as keyof typeof CATEGORY_MAPPING] || category.toUpperCase();
  return WEAPON_LISTS_BY_CATEGORY[normalized as keyof typeof WEAPON_LISTS_BY_CATEGORY] || [];
}
