export const EMBED_COLOR = 0x8943F9;

export enum WeaponClassRole {
  AR = 'AR',
  SMG = 'SMG',
  LMG = 'LMG',
  SHOTGUN = 'SHOTGUN',
  MARKSMAN = 'MARKSMAN',
  SNIPER = 'SNIPER',
}

export const ROLE_POOL = {
  [WeaponClassRole.SMG]: 3,
  [WeaponClassRole.AR]: 3,
  [WeaponClassRole.SNIPER]: 1,
  [WeaponClassRole.SHOTGUN]: 1,
  [WeaponClassRole.MARKSMAN]: 1,
  [WeaponClassRole.LMG]: 1,
};

export const ROLE_DESCRIPTIONS = {
  [WeaponClassRole.AR]: 'Assault Rifles',
  [WeaponClassRole.SMG]: 'Sub-Machine Guns',
  [WeaponClassRole.LMG]: 'Light Machine Guns',
  [WeaponClassRole.SHOTGUN]: 'Shotguns',
  [WeaponClassRole.MARKSMAN]: 'Marksman Rifles',
  [WeaponClassRole.SNIPER]: 'Sniper Rifles',
};

export const ROLE_COMBINATIONS = [
  'AR/SMG',
  'AR/Sniper',
  'AR/Shotgun',
  'AR/Marksman',
  'AR/LMG',
  'SMG/AR',
  'SMG/Sniper',
  'SMG/Shotgun',
  'SMG/Marksman',
  'SMG/LMG',
  'Sniper/AR',
  'Sniper/SMG',
  'Sniper/Marksman',
  'Sniper/LMG',
  'Shotgun/AR',
  'Shotgun/SMG',
  'Marksman/AR',
  'Marksman/SMG',
  'LMG/AR',
  'LMG/SMG',
];

export function parseRoleCombination(combination: string): { role1: WeaponClassRole; role2: WeaponClassRole } {
  const [first, second] = combination.split('/');
  const roleMap: Record<string, WeaponClassRole> = {
    'AR': WeaponClassRole.AR,
    'SMG': WeaponClassRole.SMG,
    'LMG': WeaponClassRole.LMG,
    'Shotgun': WeaponClassRole.SHOTGUN,
    'SHOTGUN': WeaponClassRole.SHOTGUN,
    'Marksman': WeaponClassRole.MARKSMAN,
    'MARKSMAN': WeaponClassRole.MARKSMAN,
    'Sniper': WeaponClassRole.SNIPER,
    'SNIPER': WeaponClassRole.SNIPER,
  };
  return {
    role1: roleMap[first],
    role2: roleMap[second],
  };
}

export const WEAPONS = {
  [WeaponClassRole.AR]: [
    'Type 19', 'XM4', 'Oden', 'DR-H', 'HVK-30', 'Krig 6', 'BP50', 'LK24',
    'Grau 5.56', 'RAM-7', 'Type 25', 'Kilo 141', 'Groza',
  ],
  [WeaponClassRole.SMG]: [
    'VMP', 'USS 9', 'Fennec', 'Switchblade X9', 'CBR4', 'PDW-57',
    'KSP 45', 'LAPA', 'GKS', 'CX-9',
  ],
  [WeaponClassRole.LMG]: [
    'PKM', 'Holger 26', 'MG 82',
  ],
  [WeaponClassRole.SHOTGUN]: [
    'HS0405', 'KRM-262',
  ],
  [WeaponClassRole.MARKSMAN]: [
    'Type 63', 'SKS',
  ],
  [WeaponClassRole.SNIPER]: [
    'LW3-Tundra', 'Locus', 'DL Q33',
  ],
};

export const OPERATOR_SKILLS = [
  'War Machine',
  'Equalizer',
  'Purifier',
  'Death Machine',
  'Gravity Vortex',
  'Sparrow',
  'Claw',
  'Annihilator',
  'Tempest',
];

export const LETHAL_EQUIPMENT = ['Frag Grenade', 'Sticky Grenade'];

export const TACTICAL_EQUIPMENT = ['Trophy System', 'Flash Grenade', 'Smoke Grenade'];

export const MAPS = {
  Hardpoint: ['Summit', 'Hacienda', 'Apocalypse', 'Arsenal', 'Slums'],
  'Search & Destroy': ['Tunisia', 'Firing Range', 'Kurohana Metropolis', 'Standoff', 'Coastal'],
  Control: ['Raid', 'Takeoff', 'Crossfire'],
};

export function getRoleCombinationWeapons(combination: string): string[] {
  const { role1, role2 } = parseRoleCombination(combination);
  return [...WEAPONS[role1], ...WEAPONS[role2]];
}

/** Returns a human-readable role pool status string for embeds */
export function getRolePoolDisplay(rolePool: Record<WeaponClassRole, number>): string {
  return (
    `**0/${ROLE_POOL[WeaponClassRole.SMG] - rolePool[WeaponClassRole.SMG] + rolePool[WeaponClassRole.SMG]} SMG**\n` +
    `**0/${ROLE_POOL[WeaponClassRole.AR] - rolePool[WeaponClassRole.AR] + rolePool[WeaponClassRole.AR]} AR**\n` +
    `**0/1 Sniper**\n` +
    `**0/1 Shotgun**\n` +
    `**0/1 Marksman**\n` +
    `**0/1 LMG**`
  );
}
