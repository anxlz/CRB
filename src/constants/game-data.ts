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

export const ROLE_EMOJIS = {
  [WeaponClassRole.AR]: '🔫',
  [WeaponClassRole.SMG]: '💨',
  [WeaponClassRole.HEAVY]: '💪',
  [WeaponClassRole.MARKSMAN]: '🎯',
};

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

export const OPERATOR_EMOJIS = {
  'War Machine': '💣',
  'Equalizer': '⚔️',
  'Purifier': '🔥',
  'Death Machine': '🔫',
  'Gravity Vortex': '🌀',
  'Sparrow': '🏹',
  'Claw': '🦅',
  'Annihilator': '💥',
  'Tempest': '⚡',
};

export const LETHAL_EQUIPMENT = ['Frag Grenade', 'Sticky Grenade'];

export const TACTICAL_EQUIPMENT = ['Trophy System', 'Flash Grenade', 'Smoke Grenade'];

export const EQUIPMENT_EMOJIS = {
  'Frag Grenade': '💣',
  'Sticky Grenade': '🧲',
  'Trophy System': '🛡️',
  'Flash Grenade': '⚡',
  'Smoke Grenade': '💨',
};

export const MAPS = {
  Hardpoint: ['Summit', 'Hacienda', 'Apocalypse', 'Arsenal', 'Slums'],
  'Search & Destroy': ['Tunisia', 'Firing Range', 'Kurohana Metropolis', 'Standoff', 'Coastal'],
  Control: ['Raid', 'Takeoff', 'Crossfire'],
};

export const MAP_EMOJIS = {
  Hardpoint: '⚔️',
  'Search & Destroy': '💣',
  Control: '🎯',
};
