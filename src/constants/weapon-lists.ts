// Updated weapon lists for COD Mobile
// Organized by category: AR, SMG, LMG, Shotgun, Marksman, Sniper
// Updated to match the official 2026 Esports Settings weapon class roles:
// https://www.callofduty.com/mobile/esports/esports-settings

// Weapon lists by category. Restricted weapons (NA-45, SVD, XPR-50, SO-14,
// Argus, R9-0, Shorty, D13 Sector, FHJ-18, SMRS, Thumper) are excluded.
const AR_WEAPONS = ['Type 19', 'XM4', 'Oden', 'DR-H', 'HVK-30', 'Krig 6', 'BP50', 'LK24', 'Grau 5.56', 'RAM-7', 'Type 25', 'Kilo 141', 'Groza'];
const SMG_WEAPONS = ['VMP', 'USS 9', 'Fennec', 'Switchblade X9', 'CBR4', 'PDW-57', 'KSP 45', 'LAPA', 'GKS', 'CX-9'];
const LMG_WEAPONS = ['PKM', 'Holger 26', 'MG 82'];
const SHOTGUN_WEAPONS = ['HS0405', 'KRM-262'];
const MARKSMAN_WEAPONS = ['Type 63', 'SKS'];
const SNIPER_WEAPONS = ['LW3-Tundra', 'Locus', 'DL Q33'];

// Split weapons into chunks of 24
function chunkWeapons(weapons: string[], chunkSize: number = 24): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < weapons.length; i += chunkSize) {
    chunks.push(weapons.slice(i, i + chunkSize));
  }
  return chunks;
}

// Create chunked lists
export const WEAPON_LISTS_BY_CATEGORY = {
  AR: chunkWeapons(AR_WEAPONS).map(chunk => chunk.join(', ')),
  SMG: chunkWeapons(SMG_WEAPONS).map(chunk => chunk.join(', ')),
  LMG: chunkWeapons(LMG_WEAPONS).map(chunk => chunk.join(', ')),
  SHOTGUN: chunkWeapons(SHOTGUN_WEAPONS).map(chunk => chunk.join(', ')),
  MARKSMAN: chunkWeapons(MARKSMAN_WEAPONS).map(chunk => chunk.join(', ')),
  SNIPER: chunkWeapons(SNIPER_WEAPONS).map(chunk => chunk.join(', ')),
};

// Category mapping
export const CATEGORY_MAPPING = {
  'AR': 'AR',
  'Assault Rifle': 'AR',
  'Assault Rifles': 'AR',
  'SMG': 'SMG',
  'Submachine Gun': 'SMG',
  'Submachine Guns': 'SMG',
  'LMG': 'LMG',
  'Light Machine Gun': 'LMG',
  'Light-Machine Gun': 'LMG',
  'Light Machine Guns': 'LMG',
  'SHOTGUN': 'SHOTGUN',
  'Shotgun': 'SHOTGUN',
  'Shotguns': 'SHOTGUN',
  'MARKSMAN': 'MARKSMAN',
  'Marksman': 'MARKSMAN',
  'Marksman Rifle': 'MARKSMAN',
  'Marksman Rifles': 'MARKSMAN',
  'SNIPER': 'SNIPER',
  'Sniper': 'SNIPER',
  'Sniper Rifle': 'SNIPER',
  'Sniper Rifles': 'SNIPER',
};

export function getWeaponListsForCategory(category: string): string[] {
  const normalized = CATEGORY_MAPPING[category as keyof typeof CATEGORY_MAPPING] || category.toUpperCase();
  return WEAPON_LISTS_BY_CATEGORY[normalized as keyof typeof WEAPON_LISTS_BY_CATEGORY] || [];
}
