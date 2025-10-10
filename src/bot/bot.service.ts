import { Injectable } from '@nestjs/common';
import { WeaponClassRole } from '../constants/game-data';

export interface PlayerSetup {
  userId: string;
  username: string;
  role1?: WeaponClassRole;
  role2?: WeaponClassRole;
  weapons?: string[];
  operatorSkill?: string;
  lethal?: string;
  tactical?: string;
}

export interface TeamSetup {
  guildId: string;
  channelId: string;
  messageId?: string;
  currentPage: 'roles' | 'weapons' | 'operators' | 'equipment' | 'maps' | 'preview';
  players: PlayerSetup[];
  rolePool: Record<WeaponClassRole, number>;
}

@Injectable()
export class BotService {
  private setupChannels: Map<string, string[]> = new Map();
  private activeSetups: Map<string, TeamSetup> = new Map();

  addSetupChannel(guildId: string, channelId: string) {
    const channels = this.setupChannels.get(guildId) || [];
    if (!channels.includes(channelId)) {
      channels.push(channelId);
      this.setupChannels.set(guildId, channels);
    }
  }

  removeSetupChannel(guildId: string, channelId: string) {
    const channels = this.setupChannels.get(guildId) || [];
    this.setupChannels.set(
      guildId,
      channels.filter((c) => c !== channelId),
    );
  }

  getSetupChannels(guildId: string): string[] {
    return this.setupChannels.get(guildId) || [];
  }

  createSetup(guildId: string, channelId: string): TeamSetup {
    const setupId = `${guildId}-${channelId}`;
    const setup: TeamSetup = {
      guildId,
      channelId,
      currentPage: 'roles',
      players: [],
      rolePool: {
        [WeaponClassRole.AR]: 3,
        [WeaponClassRole.SMG]: 3,
        [WeaponClassRole.HEAVY]: 2,
        [WeaponClassRole.MARKSMAN]: 2,
      },
    };
    this.activeSetups.set(setupId, setup);
    return setup;
  }

  getSetup(guildId: string, channelId: string): TeamSetup | undefined {
    return this.activeSetups.get(`${guildId}-${channelId}`);
  }

  updateSetup(guildId: string, channelId: string, setup: TeamSetup) {
    this.activeSetups.set(`${guildId}-${channelId}`, setup);
  }

  resetSetup(guildId: string, channelId: string) {
    this.activeSetups.delete(`${guildId}-${channelId}`);
  }

  addPlayer(setup: TeamSetup, userId: string, username: string): boolean {
    if (setup.players.length >= 5) return false;
    if (setup.players.some((p) => p.userId === userId)) return false;
    setup.players.push({ userId, username });
    return true;
  }

  removePlayer(setup: TeamSetup, userId: string): boolean {
    const index = setup.players.findIndex((p) => p.userId === userId);
    if (index === -1) return false;
    
    const player = setup.players[index];
    if (player.role1) setup.rolePool[player.role1]++;
    if (player.role2) setup.rolePool[player.role2]++;
    
    setup.players.splice(index, 1);
    return true;
  }

  setPlayerRoles(
    setup: TeamSetup,
    userId: string,
    role1: WeaponClassRole,
    role2: WeaponClassRole,
  ): boolean {
    const player = setup.players.find((p) => p.userId === userId);
    if (!player) return false;

    if (player.role1) setup.rolePool[player.role1]++;
    if (player.role2) setup.rolePool[player.role2]++;

    if (setup.rolePool[role1] <= 0 || setup.rolePool[role2] <= 0) {
      if (player.role1) setup.rolePool[player.role1]--;
      if (player.role2) setup.rolePool[player.role2]--;
      return false;
    }

    player.role1 = role1;
    player.role2 = role2;
    setup.rolePool[role1]--;
    setup.rolePool[role2]--;
    return true;
  }

  canSelectRole(setup: TeamSetup, userId: string, role: WeaponClassRole): boolean {
    const player = setup.players.find((p) => p.userId === userId);
    if (!player) return false;

    let available = setup.rolePool[role];
    if (player.role1 === role) available++;
    if (player.role2 === role) available++;
    
    return available > 0;
  }

  getAvailableWeapons(player: PlayerSetup): string[] {
    const weapons: string[] = [];
    if (player.role1) {
      const { WEAPONS } = require('../constants/game-data');
      weapons.push(...WEAPONS[player.role1]);
    }
    if (player.role2) {
      const { WEAPONS } = require('../constants/game-data');
      weapons.push(...WEAPONS[player.role2]);
    }
    return [...new Set(weapons)];
  }

  allPlayersReady(setup: TeamSetup, page: string): boolean {
    if (setup.players.length !== 5) return false;
    
    switch (page) {
      case 'roles':
        return setup.players.every((p) => p.role1 && p.role2);
      case 'weapons':
        return setup.players.every((p) => p.weapons && p.weapons.length > 0);
      case 'operators':
        return setup.players.every((p) => p.operatorSkill);
      case 'equipment':
        return setup.players.every((p) => p.lethal && p.tactical);
      default:
        return false;
    }
  }

  canSelectOperator(setup: TeamSetup, userId: string, operator: string): boolean {
    return !setup.players.some(
      (p) => p.userId !== userId && p.operatorSkill === operator,
    );
  }

  getTacticalCount(setup: TeamSetup, tactical: string): number {
    return setup.players.filter((p) => p.tactical === tactical).length;
  }
}
