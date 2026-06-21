import { Injectable } from '@nestjs/common';
import { WeaponClassRole, ROLE_POOL, GameMode } from '../constants/game-data';
import { Client, TextChannel } from 'discord.js';
import { CustomGunsService } from './custom-guns.service';
import * as fs from 'fs';
import * as path from 'path';

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface ModeLoadout {
  weapons: string[];
  operatorSkill: string;
  lethal: string;
  tactical: string;
}

export interface PlayerSetup {
  userId: string;
  username: string;
  role1?: WeaponClassRole;
  role2?: WeaponClassRole;
  // Temporary fields used while a mode loadout is being built
  weapons?: string[];
  operatorSkill?: string;
  lethal?: string;
  tactical?: string;
  // Completed per-mode loadouts (set once tactical is confirmed)
  loadouts?: Partial<Record<GameMode, ModeLoadout>>;
  // Which game mode the player is currently filling in
  activeMode?: GameMode | null;
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

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class BotService {
  private setupChannels: Map<string, string[]>  = new Map();
  private activeSetups:  Map<string, TeamSetup> = new Map();
  private logChannels:   Map<string, string>    = new Map();
  private managerRoles:  Map<string, string>    = new Map();
  private testMode = false;
  private client: Client | null = null;
  private customEmojis: Map<string, Map<string, string>> = new Map();
  private setupMessageIds: Map<string, string> = new Map();
  private messageIdsFile = path.join(process.cwd(), 'data', 'setup-message-ids.json');

  constructor(private readonly customGunsService: CustomGunsService) {
    this.loadSetupMessageIds();
  }

  // ── Persistence ─────────────────────────────────────────────────────────────

  private loadSetupMessageIds() {
    try {
      if (!fs.existsSync(path.dirname(this.messageIdsFile))) {
        fs.mkdirSync(path.dirname(this.messageIdsFile), { recursive: true });
      }
      if (fs.existsSync(this.messageIdsFile)) {
        const data = fs.readFileSync(this.messageIdsFile, 'utf-8');
        this.setupMessageIds = new Map(Object.entries(JSON.parse(data)));
      }
    } catch (e) {
      console.error('Error loading setup message IDs:', e);
      this.setupMessageIds = new Map();
    }
  }

  private saveSetupMessageIds() {
    try {
      fs.writeFileSync(
        this.messageIdsFile,
        JSON.stringify(Object.fromEntries(this.setupMessageIds), null, 2),
      );
    } catch (e) {
      console.error('Error saving setup message IDs:', e);
    }
  }

  // ── Role pool ────────────────────────────────────────────────────────────────

  private freshRolePool(): Record<WeaponClassRole, number> {
    return {
      [WeaponClassRole.SMG]:      ROLE_POOL[WeaponClassRole.SMG],
      [WeaponClassRole.AR]:       ROLE_POOL[WeaponClassRole.AR],
      [WeaponClassRole.SNIPER]:   ROLE_POOL[WeaponClassRole.SNIPER],
      [WeaponClassRole.SHOTGUN]:  ROLE_POOL[WeaponClassRole.SHOTGUN],
      [WeaponClassRole.MARKSMAN]: ROLE_POOL[WeaponClassRole.MARKSMAN],
      [WeaponClassRole.LMG]:      ROLE_POOL[WeaponClassRole.LMG],
    };
  }

  // ── Client / channels ────────────────────────────────────────────────────────

  setClient(client: Client) { this.client = client; }

  addSetupChannel(guildId: string, channelId: string) {
    const ch = this.setupChannels.get(guildId) || [];
    if (!ch.includes(channelId)) { ch.push(channelId); this.setupChannels.set(guildId, ch); }
  }

  removeSetupChannel(guildId: string, channelId: string) {
    this.setupChannels.set(
      guildId,
      (this.setupChannels.get(guildId) || []).filter(c => c !== channelId),
    );
  }

  getSetupChannels(guildId: string): string[] {
    return this.setupChannels.get(guildId) || [];
  }

  setSetupMessageId(guildId: string, channelId: string, messageId: string) {
    const key = `${guildId}-${channelId}`;
    this.setupMessageIds.set(key, messageId);
    this.saveSetupMessageIds();
    const setup = this.getSetup(guildId, channelId);
    if (setup) { setup.messageId = messageId; this.updateSetup(guildId, channelId, setup); }
  }

  getSetupMessageId(guildId: string, channelId: string): string | undefined {
    return this.setupMessageIds.get(`${guildId}-${channelId}`);
  }

  // ── Setup CRUD ───────────────────────────────────────────────────────────────

  createSetup(guildId: string, channelId: string): TeamSetup {
    const setup: TeamSetup = {
      guildId, channelId,
      currentPage: 'roles',
      players: [],
      rolePool: this.freshRolePool(),
      lastQueueTime: new Date(),
      status: 'waiting',
    };
    this.activeSetups.set(`${guildId}-${channelId}`, setup);
    return setup;
  }

  getSetup(guildId: string, channelId: string): TeamSetup | undefined {
    return this.activeSetups.get(`${guildId}-${channelId}`);
  }

  updateSetup(guildId: string, channelId: string, setup: TeamSetup) {
    this.activeSetups.set(`${guildId}-${channelId}`, setup);
  }

  resetSetup(guildId: string, channelId: string) {
    const key = `${guildId}-${channelId}`;
    const setup = this.activeSetups.get(key);
    if (setup) setup.lastQueueTime = new Date();
    this.activeSetups.delete(key);
  }

  // ── Players ──────────────────────────────────────────────────────────────────

  addPlayer(setup: TeamSetup, userId: string, username: string): boolean {
    const max = this.testMode ? 1 : 5;
    if (setup.players.length >= max) return false;
    if (setup.players.some(p => p.userId === userId)) return false;
    if (setup.players.length === 0 || setup.status === 'completed') setup.lastQueueTime = new Date();
    setup.players.push({ userId, username, loadouts: {} });
    setup.status = setup.players.length === max ? 'active' : 'in_progress';
    return true;
  }

  removePlayer(setup: TeamSetup, userId: string): boolean {
    const idx = setup.players.findIndex(p => p.userId === userId);
    if (idx === -1) return false;
    const player = setup.players[idx];
    if (player.role1) setup.rolePool[player.role1]++;
    if (player.role2) setup.rolePool[player.role2]++;
    setup.players.splice(idx, 1);
    const max = this.testMode ? 1 : 5;
    setup.status = setup.players.length === 0 ? 'waiting'
      : setup.players.length === max ? 'active'
      : 'in_progress';
    return true;
  }

  // ── Role / weapon helpers ────────────────────────────────────────────────────

  setPlayerRoles(setup: TeamSetup, userId: string, role1: WeaponClassRole, role2: WeaponClassRole): boolean {
    const player = setup.players.find(p => p.userId === userId);
    if (!player) return false;
    if (player.role1) setup.rolePool[player.role1]++;
    if (player.role2) setup.rolePool[player.role2]++;
    if (setup.rolePool[role1] <= 0 || setup.rolePool[role2] <= 0) {
      if (player.role1) setup.rolePool[player.role1]--;
      if (player.role2) setup.rolePool[player.role2]--;
      return false;
    }
    player.role1 = role1; player.role2 = role2;
    setup.rolePool[role1]--; setup.rolePool[role2]--;
    return true;
  }

  canSelectRole(setup: TeamSetup, userId: string, role: WeaponClassRole): boolean {
    const player = setup.players.find(p => p.userId === userId);
    if (!player) return false;
    let avail = setup.rolePool[role];
    if (player.role1 === role) avail++;
    if (player.role2 === role) avail++;
    return avail > 0;
  }

  getAvailableWeapons(player: PlayerSetup, guildId?: string): string[] {
    const { WEAPONS } = require('../constants/game-data');
    const weapons: string[] = [];
    if (player.role1) {
      weapons.push(...WEAPONS[player.role1]);
      if (guildId) weapons.push(...this.customGunsService.getGunsByCategory(guildId, player.role1).map(g => g.name));
    }
    if (player.role2) {
      weapons.push(...WEAPONS[player.role2]);
      if (guildId) weapons.push(...this.customGunsService.getGunsByCategory(guildId, player.role2).map(g => g.name));
    }
    return [...new Set(weapons)];
  }

  // ── Per-mode selection helpers ───────────────────────────────────────────────

  /**
   * Returns true if no other player has claimed `operator` in `mode`.
   * Checks both committed loadouts and in-progress temp fields.
   */
  canSelectOperatorForMode(
    setup: TeamSetup,
    userId: string,
    operator: string,
    mode: GameMode,
  ): boolean {
    return !setup.players.some(p => {
      if (p.userId === userId) return false;
      return (
        p.loadouts?.[mode]?.operatorSkill === operator ||
        (p.activeMode === mode && p.operatorSkill === operator)
      );
    });
  }

  /**
   * Counts how many players (excluding `excludeUserId`) have chosen `tactical`
   * in `mode` — checking both committed loadouts and in-progress temp fields.
   */
  getTacticalCountForMode(
    setup: TeamSetup,
    tactical: string,
    mode: GameMode,
    excludeUserId?: string,
  ): number {
    return setup.players.filter(p => {
      if (excludeUserId && p.userId === excludeUserId) return false;
      return (
        p.loadouts?.[mode]?.tactical === tactical ||
        (p.activeMode === mode && p.tactical === tactical)
      );
    }).length;
  }

  /** True when every player in the setup has all three mode loadouts complete. */
  allModesComplete(setup: TeamSetup): boolean {
    const required = this.testMode ? 1 : 5;
    if (setup.players.length !== required) return false;
    return setup.players.every(p =>
      p.loadouts?.hardpoint && p.loadouts?.searchAndDestroy && p.loadouts?.control,
    );
  }

  // ── Legacy "ready" helpers (kept for backward compat) ────────────────────────

  allPlayersReady(setup: TeamSetup, page: string): boolean {
    const required = this.testMode ? 1 : 5;
    if (setup.players.length !== required) return false;
    switch (page) {
      case 'roles':     return setup.players.every(p => p.role1 && p.role2);
      case 'weapons':   return setup.players.every(p => p.weapons && p.weapons.length >= 2);
      case 'operators': return setup.players.every(p => p.operatorSkill);
      case 'equipment':
        if (setup.players.every(p => p.lethal && p.tactical)) { setup.status = 'completed'; return true; }
        return false;
      default:          return false;
    }
  }

  // ── Operator / tactical helpers (legacy) ─────────────────────────────────────

  canSelectOperator(setup: TeamSetup, userId: string, operator: string): boolean {
    return !setup.players.some(p => p.userId !== userId && p.operatorSkill === operator);
  }

  getTacticalCount(setup: TeamSetup, tactical: string): number {
    return setup.players.filter(p => p.tactical === tactical).length;
  }

  // ── Logging / config ─────────────────────────────────────────────────────────

  setLogChannel(guildId: string, channelId: string)  { this.logChannels.set(guildId, channelId); }
  getLogChannel(guildId: string)                      { return this.logChannels.get(guildId); }
  setManagerRole(guildId: string, roleId: string)     { this.managerRoles.set(guildId, roleId); }
  getManagerRole(guildId: string)                     { return this.managerRoles.get(guildId); }
  setTestMode(enabled: boolean)                       { this.testMode = enabled; console.log('[TEST MODE]', enabled ? 'ON' : 'OFF'); }
  isTestMode(): boolean                               { return this.testMode; }

  async sendLog(guildId: string, message: string, data?: any) {
    console.log(message, data || '');
    const channelId = this.logChannels.get(guildId);
    if (!channelId || !this.client) return;
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel && channel.isTextBased()) {
        await (channel as TextChannel).send({
          embeds: [{
            color: 0x8943f9,
            description: data ? `${message}\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`` : message,
            timestamp: new Date().toISOString(),
          }],
        });
      }
    } catch (e) { console.error('Failed to send log:', e); }
  }

  // ── Emoji helpers ─────────────────────────────────────────────────────────────

  setCustomEmoji(guildId: string, category: string, item: string, emoji: string) {
    if (!this.customEmojis.has(guildId)) this.customEmojis.set(guildId, new Map());
    this.customEmojis.get(guildId)!.set(`${category}:${item}`, emoji);
  }

  getCustomEmoji(guildId: string, category: string, item: string): string | undefined {
    return this.customEmojis.get(guildId)?.get(`${category}:${item}`);
  }

  getAllCustomEmojis(guildId: string) { return this.customEmojis.get(guildId); }

  removeCustomEmoji(guildId: string, category: string, item: string) {
    this.customEmojis.get(guildId)?.delete(`${category}:${item}`);
  }

  formatWithEmoji(guildId: string, category: string, item: string): string {
    const emoji = this.getCustomEmoji(guildId, category, item);
    return emoji ? `${emoji} ${item}` : item;
  }

  // ── Embed helpers ─────────────────────────────────────────────────────────────

  /** Returns the role pool status lines for shared-channel embed descriptions. */
  getRolePoolLines(setup: TeamSetup): string {
    const p = setup.rolePool;
    const used = (role: WeaponClassRole, max: number) =>
      `**${max - p[role]}/${max} ${role}**`;
    return [
      used(WeaponClassRole.SMG,      3),
      used(WeaponClassRole.AR,       3),
      used(WeaponClassRole.SNIPER,   1),
      used(WeaponClassRole.SHOTGUN,  1),
      used(WeaponClassRole.MARKSMAN, 1),
      used(WeaponClassRole.LMG,      1),
    ].join('\n');
  }
}
