export const EMBED_COLOR = 0x8943F9;

export enum WeaponClassRole {
  AR       = 'AR',
  SMG      = 'SMG',
  LMG      = 'LMG',
  SHOTGUN  = 'SHOTGUN',
  MARKSMAN = 'MARKSMAN',
  SNIPER   = 'SNIPER',
}

export type GameMode = 'hardpoint' | 'searchAndDestroy' | 'control';

export const GAME_MODE_SEQUENCE: GameMode[] = [
  'hardpoint',
  'searchAndDestroy',
  'control',
];

export const GAME_MODE_LABELS: Record<GameMode, string> = {
  hardpoint:        '**HARDPOINT**',
  searchAndDestroy: '**SEARCH & DESTROY**',
  control:          '**CONTROL**',
};

export const ROLE_POOL = {
  [WeaponClassRole.SMG]:      3,
  [WeaponClassRole.AR]:       3,
  [WeaponClassRole.SNIPER]:   1,
  [WeaponClassRole.SHOTGUN]:  1,
  [WeaponClassRole.MARKSMAN]: 1,
  [WeaponClassRole.LMG]:      1,
};

export const ROLE_DESCRIPTIONS = {
  [WeaponClassRole.AR]:       'Assault Rifles',
  [WeaponClassRole.SMG]:      'Sub-Machine Guns',
  [WeaponClassRole.LMG]:      'Light Machine Guns',
  [WeaponClassRole.SHOTGUN]:  'Shotguns',
  [WeaponClassRole.MARKSMAN]: 'Marksman Rifles',
  [WeaponClassRole.SNIPER]:   'Sniper Rifles',
};

// Exactly 25 combinations — Discord's hard select-menu option limit.
// Previously missing 5 have been added:
//   Shotgun/Sniper, Shotgun/LMG, Marksman/Sniper, Marksman/LMG, LMG/Sniper
// LMG/Marksman was intentionally excluded to stay at the 25-option cap.
export const ROLE_COMBINATIONS: string[] = [
  // AR-first (5)
  'AR/SMG', 'AR/Sniper', 'AR/Shotgun', 'AR/Marksman', 'AR/LMG',
  // SMG-first (5)
  'SMG/AR', 'SMG/Sniper', 'SMG/Shotgun', 'SMG/Marksman', 'SMG/LMG',
  // Sniper-first (4)
  'Sniper/AR', 'Sniper/SMG', 'Sniper/Marksman', 'Sniper/LMG',
  // Shotgun-first (4)
  'Shotgun/AR', 'Shotgun/SMG', 'Shotgun/Sniper', 'Shotgun/LMG',
  // Marksman-first (4)
  'Marksman/AR', 'Marksman/SMG', 'Marksman/Sniper', 'Marksman/LMG',
  // LMG-first (3)
  'LMG/AR', 'LMG/SMG', 'LMG/Sniper',
  // Total = 25
];

export function parseRoleCombination(combination: string): {
  role1: WeaponClassRole;
  role2: WeaponClassRole;
} {
  const [first, second] = combination.split('/');
  const roleMap: Record<string, WeaponClassRole> = {
    AR:       WeaponClassRole.AR,
    SMG:      WeaponClassRole.SMG,
    LMG:      WeaponClassRole.LMG,
    Shotgun:  WeaponClassRole.SHOTGUN,
    SHOTGUN:  WeaponClassRole.SHOTGUN,
    Marksman: WeaponClassRole.MARKSMAN,
    MARKSMAN: WeaponClassRole.MARKSMAN,
    Sniper:   WeaponClassRole.SNIPER,
    SNIPER:   WeaponClassRole.SNIPER,
  };
  return { role1: roleMap[first], role2: roleMap[second] };
}

export const WEAPONS: Record<WeaponClassRole, string[]> = {
  [WeaponClassRole.AR]: [
    'Type 19', 'XM4', 'Oden', 'DR-H', 'HVK-30', 'Krig 6', 'BP50', 'LK24',
    'Grau 5.56', 'RAM-7', 'Type 25', 'Kilo 141', 'Groza',
  ],
  [WeaponClassRole.SMG]: [
    'VMP', 'USS 9', 'Fennec', 'Switchblade X9', 'CBR4', 'PDW-57',
    'KSP 45', 'LAPA', 'GKS', 'CX-9',
  ],
  [WeaponClassRole.LMG]:      ['PKM', 'Holger 26', 'MG 82'],
  [WeaponClassRole.SHOTGUN]:  ['HS0405', 'KRM-262'],
  [WeaponClassRole.MARKSMAN]: ['Type 63', 'SKS'],
  [WeaponClassRole.SNIPER]:   ['LW3-Tundra', 'Locus', 'DL Q33'],
};

export const OPERATOR_SKILLS = [
  'War Machine', 'Equalizer', 'Purifier', 'Death Machine',
  'Gravity Vortex', 'Sparrow', 'Claw', 'Annihilator', 'Tempest',
];

export const LETHAL_EQUIPMENT   = ['Frag Grenade', 'Sticky Grenade'];
export const TACTICAL_EQUIPMENT = ['Trophy System', 'Flash Grenade', 'Smoke Grenade'];

export const MAPS = {
  Hardpoint:          ['Summit', 'Hacienda', 'Apocalypse', 'Arsenal', 'Slums'],
  'Search & Destroy': ['Tunisia', 'Firing Range', 'Kurohana Metropolis', 'Standoff', 'Coastal'],
  Control:            ['Raid', 'Takeoff', 'Crossfire'],
};

export function getRoleCombinationWeapons(combination: string): string[] {
  const { role1, role2 } = parseRoleCombination(combination);
  return [...WEAPONS[role1], ...WEAPONS[role2]];
}

export function getRolePoolDisplay(rolePool: Record<WeaponClassRole, number>): string {
  const m = ROLE_POOL;
  return [
    `**${m[WeaponClassRole.SMG]      - rolePool[WeaponClassRole.SMG]     }/${m[WeaponClassRole.SMG]}      SMG**`,
    `**${m[WeaponClassRole.AR]       - rolePool[WeaponClassRole.AR]      }/${m[WeaponClassRole.AR]}       AR**`,
    `**${m[WeaponClassRole.SNIPER]   - rolePool[WeaponClassRole.SNIPER]  }/${m[WeaponClassRole.SNIPER]}   Sniper**`,
    `**${m[WeaponClassRole.SHOTGUN]  - rolePool[WeaponClassRole.SHOTGUN] }/${m[WeaponClassRole.SHOTGUN]}  Shotgun**`,
    `**${m[WeaponClassRole.MARKSMAN] - rolePool[WeaponClassRole.MARKSMAN]}/${m[WeaponClassRole.MARKSMAN]} Marksman**`,
    `**${m[WeaponClassRole.LMG]      - rolePool[WeaponClassRole.LMG]     }/${m[WeaponClassRole.LMG]}      LMG**`,
  ].join('\n');
}
