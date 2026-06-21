import { Injectable } from '@nestjs/common';
import { Context, StringSelect, StringSelectContext, SelectedStrings } from 'necord';
import { BotService } from '../bot.service';
import {
  EMBED_COLOR,
  ROLE_COMBINATIONS,
  parseRoleCombination,
  WEAPONS,
  OPERATOR_SKILLS,
  LETHAL_EQUIPMENT,
  TACTICAL_EQUIPMENT,
  GAME_MODE_SEQUENCE,
  GAME_MODE_LABELS,
  GameMode,
} from '../../constants/game-data';

const BANNER_URL =
  'https://media.discordapp.net/attachments/1413190110694084789/1430281339231277066/bwDlFcd.png?ex=68f9dd8c&is=68f88c0c&hm=07f8d5ab727cce9b9122a8a17ecbc9dd53425a229cb9f666ad05dd112221194d&=&format=png&quality=lossless&width=400&height=63';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function truncate(s: string, max = 100): string {
  return s.length <= max ? s : s.slice(0, max - 3) + '...';
}

/** One-line summary of a completed mode loadout. */
function loadoutLine(loadout: { weapons: string[]; operatorSkill: string; lethal: string; tactical: string }) {
  return `${loadout.weapons.join(' / ')} | ${loadout.operatorSkill} | ${loadout.lethal} | ${loadout.tactical}`;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

@Injectable()
export class RoleInteractionHandler {
  constructor(private readonly botService: BotService) {}

  // ── Step 1 — Role combination ──────────────────────────────────────────────

  @StringSelect('select_role_combination')
  public async onSelectRoleCombination(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId   = interaction.guildId!;
    const channelId = interaction.channelId;
    const combo     = selected[0];

    let setup = this.botService.getSetup(guildId, channelId);
    if (!setup) {
      setup = this.botService.createSetup(guildId, channelId);
      setup.messageId = interaction.message.id;
    }

    let player = setup.players.find(p => p.userId === interaction.user.id);
    if (!player) {
      const max = this.botService.isTestMode() ? 1 : 5;
      if (setup.players.length >= max) {
        return interaction.reply({ content: 'The setup is full (max 5 players).', ephemeral: true });
      }
      player = { userId: interaction.user.id, username: interaction.user.username, loadouts: {} };
      setup.players.push(player);
    }

    const { role1, role2 } = parseRoleCombination(combo);

    // Return old roles to pool before checking new ones
    if (player.role1) setup.rolePool[player.role1]++;
    if (player.role2) setup.rolePool[player.role2]++;

    if (setup.rolePool[role1] <= 0 || setup.rolePool[role2] <= 0) {
      // Revert
      if (player.role1) setup.rolePool[player.role1]--;
      if (player.role2) setup.rolePool[player.role2]--;
      this.botService.updateSetup(guildId, channelId, setup);
      return interaction.reply({ content: `❌ That role pool is full. Please choose a different combination.`, ephemeral: true });
    }

    // Reset all previous selections
    player.role1 = role1;
    player.role2 = role2;
    player.loadouts  = {};
    player.activeMode = 'hardpoint';
    player.weapons    = [];
    player.operatorSkill = null;
    player.lethal    = null;
    player.tactical  = null;
    setup.rolePool[role1]--;
    setup.rolePool[role2]--;
    this.botService.updateSetup(guildId, channelId, setup);

    // Start Hardpoint gun-1 prompt (ephemeral)
    const gun1Options = this.weaponOptions(guildId, WEAPONS[role1]);
    await interaction.reply({
      content: this.modeHeader('hardpoint') + `\n\nSelect your **1st weapon** (${role1}):`,
      components: [this.selectRow('select_weapon_from_combination', `1st Weapon (${role1})`, gun1Options)],
      ephemeral: true,
    });

    // Update shared channel message
    await this.updateMainEmbed(interaction, setup);
  }

  // ── Step 2 — 1st weapon ────────────────────────────────────────────────────

  @StringSelect('select_weapon_from_combination')
  public async onSelectWeaponFromCombination(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId   = interaction.guildId!;
    const channelId = interaction.channelId;
    const weapon    = selected[0];

    const setup  = this.botService.getSetup(guildId, channelId);
    const player = setup?.players.find(p => p.userId === interaction.user.id);
    if (!setup || !player) {
      return interaction.reply({ content: 'No active setup found!', ephemeral: true });
    }

    player.weapons = [weapon];
    this.botService.updateSetup(guildId, channelId, setup);

    const gun2Options = this.weaponOptions(
      guildId,
      (WEAPONS[player.role2] || []).filter(w => w !== weapon),
    );
    const mode = player.activeMode as GameMode;

    await interaction.update({
      content:
        this.modeHeader(mode) +
        `\n✔ **1st weapon:** ${weapon}\n\nSelect your **2nd weapon** (${player.role2}):`,
      components: [this.selectRow('select_second_weapon', `2nd Weapon (${player.role2})`, gun2Options)],
    });
  }

  // ── Step 3 — 2nd weapon ────────────────────────────────────────────────────

  @StringSelect('select_second_weapon')
  public async onSelectSecondWeapon(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId   = interaction.guildId!;
    const channelId = interaction.channelId;
    const weapon    = selected[0];

    const setup  = this.botService.getSetup(guildId, channelId);
    const player = setup?.players.find(p => p.userId === interaction.user.id);
    if (!setup || !player) {
      return interaction.reply({ content: 'No active setup found!', ephemeral: true });
    }

    player.weapons = [...(player.weapons || []), weapon];
    this.botService.updateSetup(guildId, channelId, setup);

    const mode = player.activeMode as GameMode;

    // Operator list: exclude operators already taken by others for this mode
    const availableOps = OPERATOR_SKILLS.filter(op =>
      this.botService.canSelectOperatorForMode(setup, interaction.user.id, op, mode),
    ).map(op => ({
      label: truncate(this.botService.formatWithEmoji(guildId, 'operator', op)),
      value: op,
    }));

    const w1 = player.weapons[0];
    const w2 = weapon;

    await interaction.update({
      content:
        this.modeHeader(mode) +
        `\n✔ **Weapons:** ${w1} / ${w2}\n\nSelect your **Operator Skill**:`,
      components: [
        this.selectRow(
          'select_operator_private',
          'Select Operator Skill',
          availableOps.length ? availableOps : [{ label: 'No operators available', value: 'none' }],
        ),
      ],
    });
  }

  // ── Step 4 — Operator ──────────────────────────────────────────────────────

  @StringSelect('select_operator_private')
  public async onSelectOperatorPrivate(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId   = interaction.guildId!;
    const channelId = interaction.channelId;
    const opName    = selected[0];

    if (opName === 'none') {
      return interaction.reply({ content: 'All operators are taken for this mode!', ephemeral: true });
    }

    const setup  = this.botService.getSetup(guildId, channelId);
    const player = setup?.players.find(p => p.userId === interaction.user.id);
    if (!setup || !player) {
      return interaction.reply({ content: 'No active setup found!', ephemeral: true });
    }

    const mode = player.activeMode as GameMode;

    if (!this.botService.canSelectOperatorForMode(setup, interaction.user.id, opName, mode)) {
      return interaction.reply({
        content: `**${opName}** was just taken for ${GAME_MODE_LABELS[mode]}. Please pick again.`,
        ephemeral: true,
      });
    }

    player.operatorSkill = opName;
    this.botService.updateSetup(guildId, channelId, setup);

    const lethalOpts = LETHAL_EQUIPMENT.map(l => ({
      label: truncate(this.botService.formatWithEmoji(guildId, 'lethal', l)),
      value: l,
    }));

    const opLabel = this.botService.formatWithEmoji(guildId, 'operator', opName);

    await interaction.update({
      content:
        this.modeHeader(mode) +
        `\n✔ **Operator:** ${opLabel}\n\nSelect your **Lethal Equipment**:`,
      components: [this.selectRow('select_lethal_private', 'Select Lethal Equipment', lethalOpts)],
    });
  }

  // ── Step 5 — Lethal ────────────────────────────────────────────────────────

  @StringSelect('select_lethal_private')
  public async onSelectLethalPrivate(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId   = interaction.guildId!;
    const channelId = interaction.channelId;
    const lethal    = selected[0];

    const setup  = this.botService.getSetup(guildId, channelId);
    const player = setup?.players.find(p => p.userId === interaction.user.id);
    if (!setup || !player) {
      return interaction.reply({ content: 'No active setup found!', ephemeral: true });
    }

    player.lethal = lethal;
    this.botService.updateSetup(guildId, channelId, setup);

    const mode = player.activeMode as GameMode;

    const tacOpts = TACTICAL_EQUIPMENT
      .map(tac => {
        const count = this.botService.getTacticalCountForMode(
          setup, tac, mode, interaction.user.id,
        );
        return { tac, count };
      })
      .filter(({ count }) => count < 3)
      .map(({ tac, count }) => ({
        label:       truncate(this.botService.formatWithEmoji(guildId, 'tactical', tac)),
        value:       tac,
        description: `${count}/3 used`,
      }));

    const lethalLabel = this.botService.formatWithEmoji(guildId, 'lethal', lethal);

    await interaction.update({
      content:
        this.modeHeader(mode) +
        `\n✔ **Lethal:** ${lethalLabel}\n\nSelect your **Tactical Equipment**:`,
      components: [
        this.selectRow(
          'select_tactical_private',
          'Select Tactical Equipment',
          tacOpts.length ? tacOpts : [{ label: 'All tactical at max (3/3)', value: 'none' }],
        ),
      ],
    });
  }

  // ── Step 6 — Tactical (saves mode, transitions or finalises) ──────────────

  @StringSelect('select_tactical_private')
  public async onSelectTacticalPrivate(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId   = interaction.guildId!;
    const channelId = interaction.channelId;
    const tactical  = selected[0];

    if (tactical === 'none') {
      return interaction.reply({
        content: 'No tactical available — all types are at 3/3 for this mode.',
        ephemeral: true,
      });
    }

    const setup  = this.botService.getSetup(guildId, channelId);
    const player = setup?.players.find(p => p.userId === interaction.user.id);
    if (!setup || !player) {
      return interaction.reply({ content: 'No active setup found!', ephemeral: true });
    }

    const mode = player.activeMode as GameMode;

    // Final tactical check
    const count = this.botService.getTacticalCountForMode(
      setup, tactical, mode, interaction.user.id,
    );
    if (count >= 3) {
      return interaction.reply({
        content: `**${tactical}** just hit max (3/3) for ${GAME_MODE_LABELS[mode]}. Please try again.`,
        ephemeral: true,
      });
    }

    // ── Commit the completed loadout for this mode ────────────────────────────
    player.loadouts = player.loadouts || {};
    player.loadouts[mode] = {
      weapons:      [...(player.weapons || [])],
      operatorSkill: player.operatorSkill!,
      lethal:       player.lethal!,
      tactical,
    };

    // Clear temp fields ready for next mode
    player.weapons      = [];
    player.operatorSkill = null;
    player.lethal       = null;
    player.tactical     = null;

    // ── Find the next mode in the sequence ────────────────────────────────────
    const modeIdx  = GAME_MODE_SEQUENCE.indexOf(mode);
    const nextMode = GAME_MODE_SEQUENCE[modeIdx + 1] as GameMode | undefined;

    if (nextMode) {
      player.activeMode = nextMode;
      this.botService.updateSetup(guildId, channelId, setup);

      const gun1Options = this.weaponOptions(guildId, WEAPONS[player.role1!]);

      // Respond to interaction first (within 3-second window)
      await interaction.update({
        content:
          `✅ **${GAME_MODE_LABELS[mode]}** loadout saved!\n\n` +
          this.modeHeader(nextMode) +
          `\n\nSelect your **1st weapon** (${player.role1}):`,
        components: [
          this.selectRow(
            'select_weapon_from_combination',
            `1st Weapon (${player.role1})`,
            gun1Options,
          ),
        ],
      });

      // Then update shared channel message to reflect this mode being done
      const msg = await interaction.channel?.messages.fetch(setup.messageId!).catch(() => null);
      if (msg) await this.editMainMessage(msg, setup);

    } else {
      // All 3 modes done for this player
      player.activeMode = null;
      this.botService.updateSetup(guildId, channelId, setup);

      // Show full summary in ephemeral
      await interaction.update({
        content: this.buildPlayerSummary(player),
        components: [],
      });

      // Check if every player is done → update or finalise main message
      const msg = await interaction.channel?.messages.fetch(setup.messageId!).catch(() => null);
      if (msg) await this.checkAndFinalize(msg, setup, guildId);
    }
  }

  // ── Shared-channel embed helpers ───────────────────────────────────────────

  /** Fetches the main message then delegates to `editMainMessage`. */
  private async updateMainEmbed(interaction: any, setup: any) {
    const msg = await interaction.channel?.messages.fetch(setup.messageId!).catch(() => null);
    if (msg) await this.editMainMessage(msg, setup);
  }

  /** Edits the shared channel message with the current progress. */
  private async editMainMessage(message: any, setup: any) {
    const statusEmoji = { waiting: '⏳', in_progress: '🔄', active: '✅', completed: '✔️' };
    const queueTime   = setup.lastQueueTime?.toLocaleString() ?? new Date().toLocaleString();

    const description =
      setup.players.map((p) => this.formatPlayerStatus(p)).join('\n') +
      '\n\n' +
      this.botService.getRolePoolLines(setup) +
      `\n\n**Last Queue Date: ${queueTime}**`;

    const embed = {
      color:  EMBED_COLOR,
      title:  `**Roster Setup ${statusEmoji[setup.status || 'waiting']} ${(setup.status ?? 'WAITING').toUpperCase()}**`,
      description,
      footer: { text: 'COD Mobile Roster' },
      image:  { url: BANNER_URL },
    };

    await message.edit({ embeds: [embed], components: this.mainComponents() }).catch(console.error);
  }

  /**
   * If all players have completed all 3 modes → show the completed roster.
   * Otherwise → show the updated progress embed.
   */
  private async checkAndFinalize(message: any, setup: any, guildId: string) {
    if (!this.botService.allModesComplete(setup)) {
      await this.editMainMessage(message, setup);
      return;
    }

    setup.status = 'completed';
    this.botService.updateSetup(guildId, setup.channelId, setup);

    const queueTime  = setup.lastQueueTime?.toLocaleString() ?? new Date().toLocaleString();
    const playerList = setup.players
      .map((p, i) =>
        `**Player ${i + 1}: <@${p.userId}>**\n` +
        `**Role: ${p.role1} / ${p.role2}**\n` +
        `**Hardpoint:** ${loadoutLine(p.loadouts.hardpoint)}\n` +
        `**Search & Destroy:** ${loadoutLine(p.loadouts.searchAndDestroy)}\n` +
        `**Control:** ${loadoutLine(p.loadouts.control)}`,
      )
      .join('\n\n──────────────────────\n\n');

    await message.edit({
      embeds: [{
        color:       EMBED_COLOR,
        title:       '**Roster Setup :**',
        description: `**Team loadouts are locked in!**\n\n${playerList}\n\n**Last Queue Date: ${queueTime}**`,
        footer:      { text: 'COD Mobile Esports' },
        image:       { url: BANNER_URL },
      }],
      components: [{
        type: 1,
        components: [{ type: 2, style: 2, label: 'Start New Setup', custom_id: 'new_setup' }],
      }],
    }).catch(console.error);

    // Log
    const logText = setup.players
      .map((p, i) =>
        `Player ${i + 1}: <@${p.userId}> — ${p.role1}/${p.role2}\n` +
        `  HP:   ${loadoutLine(p.loadouts.hardpoint)}\n` +
        `  S&D:  ${loadoutLine(p.loadouts.searchAndDestroy)}\n` +
        `  Ctrl: ${loadoutLine(p.loadouts.control)}`,
      )
      .join('\n\n');

    this.botService.sendLog(guildId, `[ROSTER COMPLETE]\n\n${logText}`);
  }

  // ── Per-player embed line ──────────────────────────────────────────────────

  private formatPlayerStatus(p: any): string {
    if (!p.role1) {
      return `**Joining…**\n<@${p.userId}>\n─────────────`;
    }

    const lines: string[] = [`**${p.role1}/${p.role2}** → <@${p.userId}>`];

    for (const mode of GAME_MODE_SEQUENCE) {
      const label   = GAME_MODE_LABELS[mode];
      const loadout = p.loadouts?.[mode];
      if (loadout) {
        lines.push(`${label}: ${loadoutLine(loadout)}`);
      } else if (p.activeMode === mode) {
        lines.push(`${label}: 🔄 Selecting...`);
      }
      // Modes not yet started are omitted intentionally
    }

    lines.push('─────────────');
    return lines.join('\n');
  }

  // ── Ephemeral summary (shown after all 3 modes done) ──────────────────────

  private buildPlayerSummary(p: any): string {
    return (
      `✅ **All loadouts complete!**\n\n` +
      `**Role:** ${p.role1} / ${p.role2}\n\n` +
      `🎯 **Hardpoint**\n` +
      `Weapons: ${p.loadouts.hardpoint.weapons.join(' / ')}\n` +
      `Operator: ${p.loadouts.hardpoint.operatorSkill}\n` +
      `Equipment: ${p.loadouts.hardpoint.lethal} | ${p.loadouts.hardpoint.tactical}\n\n` +
      `💣 **Search & Destroy**\n` +
      `Weapons: ${p.loadouts.searchAndDestroy.weapons.join(' / ')}\n` +
      `Operator: ${p.loadouts.searchAndDestroy.operatorSkill}\n` +
      `Equipment: ${p.loadouts.searchAndDestroy.lethal} | ${p.loadouts.searchAndDestroy.tactical}\n\n` +
      `⚔️ **Control**\n` +
      `Weapons: ${p.loadouts.control.weapons.join(' / ')}\n` +
      `Operator: ${p.loadouts.control.operatorSkill}\n` +
      `Equipment: ${p.loadouts.control.lethal} | ${p.loadouts.control.tactical}`
    );
  }

  // ── Low-level Discord component builders ──────────────────────────────────

  private modeHeader(mode: GameMode): string {
    return `**━━━ ${GAME_MODE_LABELS[mode]} ━━━**`;
  }

  private weaponOptions(guildId: string, weapons: string[]) {
    return weapons.slice(0, 25).map(w => ({
      label: truncate(this.botService.formatWithEmoji(guildId, 'weapon', w)),
      value: w,
    }));
  }

  private selectRow(customId: string, placeholder: string, options: any[]) {
    return {
      type: 1,
      components: [{
        type: 3,
        custom_id:   customId,
        placeholder,
        min_values:  1,
        max_values:  1,
        options,
      }],
    };
  }

  private mainComponents() {
    return [
      {
        type: 1,
        components: [{
          type:        3,
          custom_id:   'select_role_combination',
          placeholder: 'Select Role Combination',
          options:     ROLE_COMBINATIONS.map(c => ({ label: c, value: c })),
        }],
      },
      {
        type: 1,
        components: [
          { type: 2, style: 4, label: 'Leave', custom_id: 'leave_setup' },
          { type: 2, style: 2, label: 'Edit',  custom_id: 'edit_roles'  },
        ],
      },
      {
        type: 1,
        components: [{ type: 2, style: 3, label: '💡', custom_id: 'show_setup_steps' }],
      },
    ];
  }
}
