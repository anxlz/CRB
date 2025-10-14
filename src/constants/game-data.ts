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
    'M4', 'AK117', 'AK-47', 'Type 25', 'ASM10', 'BK57', 'LK24', 'M16', 'ICR-1', 
    'Man-O-War', 'HBRa3', 'KN-44', 'HVK-30', 'DR-H', 'Peacekeeper MK2', 'FR .556', 
    'AS VAL', 'CR-56 AMAX', 'M13', 'Swordfish', 'Kilo 141', 'Oden', 'Krig 6', 'EM2', 
    'Maddox', 'FFAR 1', 'Grau 5.56', 'Groza', 'Type 19', 'BP50', 'LAG 53', 'XM4', 
    'Vargo-S', 'RAM-7'
  ],
  [WeaponClassRole.SMG]: [
    'RUS-79U', 'PDW-57', 'HG 40', 'Chicom', 'MSMC', 'Razorback', 'Pharo', 'GKS', 
    'Cordite', 'QQ9', 'Fennec', 'AGR 556', 'QXR', 'PP19 Bizon', 'MX9', 'CBR4', 
    'PPSh-41', 'MAC-10', 'KSP 45', 'Switchblade X9', 'LAPA', 'OTs 9', 'Striker 45', 
    'CX-9', 'TEC-9', 'ISO', 'USS 9', 'VMP', 'Sten'
  ],
  [WeaponClassRole.HEAVY]: [
    'RPD', 'M4LMG', 'UL736', 'S36', 'Chopper', 'Holger 26', 'Hades', 'PKM', 'Dingo', 
    'Bruen MK9', 'MG42', 'RAAL MG', 'MG 82', 'BY15', 'Striker', 'HS2126', 'HS0405', 
    'KRM-262', 'Echo', 'R9-0', 'JAK-12', 'VLK Rogue', 'Einhorn Revolving'
  ],
  [WeaponClassRole.MARKSMAN]: [
    'DL Q33', 'M21 EBR', 'Arctic .50', 'Locus', 'Outlaw', 'Rytec AMR', 'Koshka', 
    'ZRG 20mm', 'HDR', 'LW3-Tundra', '3-Line Rifle', 'Kilo Bolt-Action', 'SKS', 
    'SP-R 208', 'MK2', 'Type 63', 'M1 Garand', 'SO-14'
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
