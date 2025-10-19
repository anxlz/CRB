// Updated weapon lists for COD Mobile
// Organized by category: AR, SMG, Heavy, Marksman

// Weapon lists by category
const AR_WEAPONS = ['Type 19', 'XM4', 'Oden', 'DR-H', 'HVK-30', 'Krig 6', 'BP50', 'LK24', 'Grau 5.56', 'RAM-7', 'Type 25', 'Kilo 141', 'Groza'];
const SMG_WEAPONS = ['VMP', 'USS 9', 'Fennec', 'Switchblade X9', 'CBR4', 'PDW-57', 'KSP 45', 'LAPA', 'GKS', 'CX-9'];
const HEAVY_WEAPONS = ['HS0405', 'R9-0', 'KRM-262', 'PKM', 'Holger 26', 'MG 82'];
const MARKSMAN_WEAPONS = ['Type 63', 'SKS', 'LW3-Tundra', 'Locus', 'DL Q33'];

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
  HEAVY: chunkWeapons(HEAVY_WEAPONS).map(chunk => chunk.join(', ')),
  MARKSMAN: chunkWeapons(MARKSMAN_WEAPONS).map(chunk => chunk.join(', '))
};

// Category mapping
export const CATEGORY_MAPPING = {
  'AR': 'AR',
  'Assault Rifle': 'AR',
  'Assault Rifles': 'AR',
  'SMG': 'SMG',
  'Submachine Gun': 'SMG',
  'Submachine Guns': 'SMG',
  'MARKSMAN': 'MARKSMAN',
  'Marksman': 'MARKSMAN',
  'Marksman Rifle': 'MARKSMAN',
  'Marksman Rifles': 'MARKSMAN',
  'HEAVY': 'HEAVY',
  'Heavy': 'HEAVY'
};

export function getWeaponListsForCategory(category: string): string[] {
  const normalized = CATEGORY_MAPPING[category as keyof typeof CATEGORY_MAPPING] || category.toUpperCase();
  return WEAPON_LISTS_BY_CATEGORY[normalized as keyof typeof WEAPON_LISTS_BY_CATEGORY] || [];
}
