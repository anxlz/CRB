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
    'Marksman': WeaponClassRole.MARKSMAN,
  };
  return {
    role1: roleMap[first],
    role2: roleMap[second],
  };
}

export const WEAPONS = {
  [WeaponClassRole.AR]: ['M13', 'DR-H', 'HVK-30', 'Vargo-S', 'BP50'],
  [WeaponClassRole.SMG]: ['USS9', 'Fennec', 'CX-9', 'QQ9'],
  [WeaponClassRole.HEAVY]: ['Holger 26', 'MG42', 'Chopper', 'HS0405', 'R9-0', 'KRM-262'],
  [WeaponClassRole.MARKSMAN]: ['Type 63', 'SKS', 'Tundra', 'DL Q33'],
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
