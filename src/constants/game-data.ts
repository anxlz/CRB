export const EMBED_COLOR = 0x8943F9;

export enum WeaponClassRole {
  AR = 'AR',
  SMG = 'SMG',
  HEAVY = 'HEAVY',
  MARKSMAN = 'MARKSMAN',
}

export const ROLE_POOL = {
  [WeaponClassRole.AR]: 3,
  [WeaponClassRole.SMG]: 3,
  [WeaponClassRole.HEAVY]: 2,
  [WeaponClassRole.MARKSMAN]: 2,
};

export const ROLE_DESCRIPTIONS = {
  [WeaponClassRole.AR]: 'Assault Rifles',
  [WeaponClassRole.SMG]: 'Sub-Machine Guns',
  [WeaponClassRole.HEAVY]: 'Shotguns & Light-Machine Guns',
  [WeaponClassRole.MARKSMAN]: 'Snipers & Marksman Rifles',
};


export const ROLE_COMBINATIONS = [
  'AR/SMG',
  'AR/Marksman',
  'AR/Heavy',
  'SMG/AR',
  'SMG/Marksman',
  'SMG/Heavy',
  'Marksman/AR',
  'Marksman/SMG',
  'Marksman/Heavy',
  'Heavy/SMG',
  'Heavy/AR',
  'Heavy/Marksman',
];

export function parseRoleCombination(combination: string): { role1: WeaponClassRole; role2: WeaponClassRole } {
  const [first, second] = combination.split('/');
  const roleMap: Record<string, WeaponClassRole> = {
    'AR': WeaponClassRole.AR,
    'SMG': WeaponClassRole.SMG,
    'Heavy': WeaponClassRole.HEAVY,
    'HEAVY': WeaponClassRole.HEAVY,
    'Marksman': WeaponClassRole.MARKSMAN,
    'MARKSMAN': WeaponClassRole.MARKSMAN,
  };
  return {
    role1: roleMap[first],
    role2: roleMap[second],
  };
}

export const WEAPONS = {
  [WeaponClassRole.AR]: [
    'Type 19', 'XM4', 'Oden', 'DR-H', 'HVK-30', 'Krig 6', 'BP50', 'LK24', 
    'Grau 5.56', 'RAM-7', 'Type 25', 'Kilo 141', 'Groza'
  ],
  [WeaponClassRole.SMG]: [
    'VMP', 'USS 9', 'Fennec', 'Switchblade X9', 'CBR4', 'PDW-57', 
    'KSP 45', 'LAPA', 'GKS', 'CX-9'
  ],
  [WeaponClassRole.HEAVY]: [
    'HS0405', 'R9-0', 'KRM-262', 'PKM', 'Holger 26', 'MG 82'
  ],
  [WeaponClassRole.MARKSMAN]: [
    'Type 63', 'SKS', 'LW3-Tundra', 'Locus', 'DL Q33'
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
