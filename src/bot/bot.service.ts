import { Injectable } from '@nestjs/common';
import { WeaponClassRole } from '../constants/game-data';
import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

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
  lastQueueTime?: Date;
  status?: 'waiting' | 'active' | 'in_progress' | 'completed';
}

@Injectable()
export class BotService {
  private setupChannels: Map<string, string[]> = new Map();
  private activeSetups: Map<string, TeamSetup> = new Map();
  private logChannels: Map<string, string> = new Map();
  private managerRoles: Map<string, string> = new Map();
  private testMode: boolean = false;
  private client: Client | null = null;
  private customEmojis: Map<string, Map<string, string>> = new Map();
  private setupMessageIds: Map<string, string> = new Map();
  private messageIdsFile = path.join(process.cwd(), 'data', 'setup-message-ids.json');

  constructor() {
    this.loadSetupMessageIds();
  }

  private loadSetupMessageIds() {
    try {
      if (!fs.existsSync(path.dirname(this.messageIdsFile))) {
        fs.mkdirSync(path.dirname(this.messageIdsFile), { recursive: true });
      }

      if (fs.existsSync(this.messageIdsFile)) {
        const data = fs.readFileSync(this.messageIdsFile, 'utf-8');
        const parsed = JSON.parse(data);
        this.setupMessageIds = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Error loading setup message IDs:', error);
      this.setupMessageIds = new Map();
    }
  }

  private saveSetupMessageIds() {
    try {
      const obj = Object.fromEntries(this.setupMessageIds);
      fs.writeFileSync(this.messageIdsFile, JSON.stringify(obj, null, 2));
    } catch (error) {
      console.error('Error saving setup message IDs:', error);
    }
  }

  setClient(client: Client) {
    this.client = client;
  }

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

  setSetupMessageId(guildId: string, channelId: string, messageId: string) {
    const setupId = `${guildId}-${channelId}`;
    this.setupMessageIds.set(setupId, messageId);
    this.saveSetupMessageIds();
    
    const setup = this.getSetup(guildId, channelId);
    if (setup) {
      setup.messageId = messageId;
      this.updateSetup(guildId, channelId, setup);
    }
  }

  getSetupMessageId(guildId: string, channelId: string): string | undefined {
    const setupId = `${guildId}-${channelId}`;
    return this.setupMessageIds.get(setupId);
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
      lastQueueTime: new Date(),
      status: 'waiting',
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
    const setupId = `${guildId}-${channelId}`;
    const setup = this.activeSetups.get(setupId);
    if (setup) {
      setup.lastQueueTime = new Date();
    }
    this.activeSetups.delete(setupId);
  }

  addPlayer(setup: TeamSetup, userId: string, username: string): boolean {
    const maxPlayers = this.testMode ? 1 : 5;
    if (setup.players.length >= maxPlayers) return false;
    if (setup.players.some((p) => p.userId === userId)) return false;
    
    if (setup.players.length === 0 || setup.status === 'completed') {
      setup.lastQueueTime = new Date();
    }
    
    setup.players.push({ userId, username });
    
    setup.status = setup.players.length === maxPlayers ? 'active' : 'in_progress';
    
    return true;
  }

  removePlayer(setup: TeamSetup, userId: string): boolean {
    const index = setup.players.findIndex((p) => p.userId === userId);
    if (index === -1) return false;
    
    const player = setup.players[index];
    if (player.role1) setup.rolePool[player.role1]++;
    if (player.role2) setup.rolePool[player.role2]++;
    
    setup.players.splice(index, 1);
    
    const maxPlayers = this.testMode ? 1 : 5;
    setup.status = setup.players.length === 0 ? 'waiting' : 
                   setup.players.length === maxPlayers ? 'active' : 'in_progress';
    
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
    const requiredPlayers = this.testMode ? 1 : 5;
    if (setup.players.length !== requiredPlayers) return false;
    
    let isReady = false;
    switch (page) {
      case 'roles':
        isReady = setup.players.every((p) => p.role1 && p.role2);
        break;
      case 'weapons':
        isReady = setup.players.every((p) => p.weapons && p.weapons.length >= 2);
        break;
      case 'operators':
        isReady = setup.players.every((p) => p.operatorSkill);
        break;
      case 'equipment':
        isReady = setup.players.every((p) => p.lethal && p.tactical);
        if (isReady) {
          setup.status = 'completed';
        }
        break;
      default:
        return false;
    }
    return isReady;
  }
  
  setLogChannel(guildId: string, channelId: string) {
    this.logChannels.set(guildId, channelId);
  }
  
  getLogChannel(guildId: string): string | undefined {
    return this.logChannels.get(guildId);
  }
  
  setManagerRole(guildId: string, roleId: string) {
    this.managerRoles.set(guildId, roleId);
  }
  
  getManagerRole(guildId: string): string | undefined {
    return this.managerRoles.get(guildId);
  }
  
  setTestMode(enabled: boolean) {
    this.testMode = enabled;
    console.log('[TEST MODE]', enabled ? 'ENABLED' : 'DISABLED');
  }
  
  isTestMode(): boolean {
    return this.testMode;
  }

  async sendLog(guildId: string, message: string, data?: any) {
    console.log(message, data || '');
    
    const logChannelId = this.logChannels.get(guildId);
    if (!logChannelId || !this.client) return;

    try {
      const channel = await this.client.channels.fetch(logChannelId);
      if (channel && channel.isTextBased()) {
        const textChannel = channel as TextChannel;
        
        const embed = {
          color: 0x8943F9,
          description: data 
            ? `${message}\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``
            : message,
          timestamp: new Date().toISOString(),
        };
        
        await textChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Failed to send log to channel:', error);
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

  setCustomEmoji(guildId: string, category: string, item: string, emoji: string) {
    if (!this.customEmojis.has(guildId)) {
      this.customEmojis.set(guildId, new Map());
    }
    const guildEmojis = this.customEmojis.get(guildId)!;
    guildEmojis.set(`${category}:${item}`, emoji);
  }

  getCustomEmoji(guildId: string, category: string, item: string): string | undefined {
    const guildEmojis = this.customEmojis.get(guildId);
    if (!guildEmojis) return undefined;
    return guildEmojis.get(`${category}:${item}`);
  }

  getAllCustomEmojis(guildId: string): Map<string, string> | undefined {
    return this.customEmojis.get(guildId);
  }

  removeCustomEmoji(guildId: string, category: string, item: string) {
    const guildEmojis = this.customEmojis.get(guildId);
    if (!guildEmojis) return;
    guildEmojis.delete(`${category}:${item}`);
  }

  formatWithEmoji(guildId: string, category: string, item: string): string {
    const emoji = this.getCustomEmoji(guildId, category, item);
    return emoji ? `${emoji} ${item}` : item;
  }
}
