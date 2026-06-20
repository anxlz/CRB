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
} from '../../constants/game-data';

const BANNER_URL =
  'https://media.discordapp.net/attachments/1413190110694084789/1430281339231277066/bwDlFcd.png?ex=68f9dd8c&is=68f88c0c&hm=07f8d5ab727cce9b9122a8a17ecbc9dd53425a229cb9f666ad05dd112221194d&=&format=png&quality=lossless&width=400&height=63';

@Injectable()
export class RoleInteractionHandler {
  constructor(private readonly botService: BotService) {}

  private truncateLabel(label: string, maxLength: number = 100): string {
    if (label.length <= maxLength) return label;
    return label.substring(0, maxLength - 3) + '...';
  }

  // ─── Step 1: Player selects role combination ────────────────────────────────

  @StringSelect('select_role_combination')
  public async onSelectRoleCombination(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;
    const combination = selected[0];

    let setup = this.botService.getSetup(guildId, channelId);
    if (!setup) {
      setup = this.botService.createSetup(guildId, channelId);
      setup.messageId = interaction.message.id;
    }

    let player = setup.players.find((p) => p.userId === interaction.user.id);
    if (!player) {
      const maxPlayers = this.botService.isTestMode() ? 1 : 5;
      if (setup.players.length >= maxPlayers) {
        return interaction.reply({
          content: 'The setup is full! Maximum 5 players allowed.',
          ephemeral: true,
        });
      }
      player = {
        userId: interaction.user.id,
        username: interaction.user.username,
        role1: null,
        role2: null,
        weapons: [],
        operatorSkill: null,
      };
      setup.players.push(player);
    }

    const { role1, role2 } = parseRoleCombination(combination);

    // Return old roles to the pool before assigning new ones
    if (player.role1) setup.rolePool[player.role1]++;
    if (player.role2) setup.rolePool[player.role2]++;

    if (setup.rolePool[role1] <= 0 || setup.rolePool[role2] <= 0) {
      if (player.role1) setup.rolePool[player.role1]--;
      if (player.role2) setup.rolePool[player.role2]--;
      this.botService.updateSetup(guildId, channelId, setup);
      return interaction.reply({
        content: `The role pool for this combination is full!`,
        ephemeral: true,
      });
    }

    // Reset all prior selections when re-picking roles
    player.weapons = [];
    player.operatorSkill = null;
    player.lethal = null;
    player.tactical = null;

    player.role1 = role1;
    player.role2 = role2;
    setup.rolePool[role1]--;
    setup.rolePool[role2]--;

    const role1Weapons = WEAPONS[player.role1] || [];
    if (role1Weapons.length === 0) {
      return interaction.reply({
        content: 'No weapons available for this role combination!',
        ephemeral: true,
      });
    }

    const weaponOptions = role1Weapons.slice(0, 25).map((weapon) => {
      const label = this.botService.formatWithEmoji(guildId, 'weapon', weapon);
      return { label: this.truncateLabel(label), value: weapon };
    });

    await interaction.reply({
      content: `You selected **${combination}**. Now choose your **1st weapon** (${player.role1}):`,
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: 'select_weapon_from_combination',
              placeholder: `Select 1st Weapon (${player.role1})`,
              options: weaponOptions,
            },
          ],
        },
      ],
      ephemeral: true,
    });

    this.botService.updateSetup(guildId, channelId, setup);
    await this.updateMainEmbed(interaction, setup);
  }

  // ─── Step 2: Player picks 1st weapon ────────────────────────────────────────

  @StringSelect('select_weapon_from_combination')
  public async onSelectWeaponFromCombination(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;
    const weapon = selected[0];

    const setup = this.botService.getSetup(guildId, channelId);
    if (!setup) {
      return interaction.reply({ content: 'No active setup found!', ephemeral: true });
    }

    const player = setup.players.find((p) => p.userId === interaction.user.id);
    if (!player) {
      return interaction.reply({ content: 'You are not in this setup!', ephemeral: true });
    }

    player.weapons = [weapon];
    this.botService.updateSetup(guildId, channelId, setup);

    const role2Weapons: string[] = WEAPONS[player.role2] || [];
    const weaponOptions = role2Weapons
      .filter((w) => w !== weapon)
      .slice(0, 25)
      .map((w) => {
        const label = this.botService.formatWithEmoji(guildId, 'weapon', w);
        return { label: this.truncateLabel(label), value: w };
      });

    const weapon1Label = this.botService.formatWithEmoji(guildId, 'weapon', weapon);

    await interaction.update({
      content: `✔ **1st weapon:** ${weapon1Label}\n\nNow choose your **2nd weapon** (${player.role2}):`,
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: 'select_second_weapon',
              placeholder: `Select 2nd Weapon (${player.role2})`,
              options: weaponOptions,
            },
          ],
        },
      ],
    });
  }

  // ─── Step 3: Player picks 2nd weapon → show operator dropdown ───────────────

  @StringSelect('select_second_weapon')
  public async onSelectSecondWeapon(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;
    const weapon = selected[0];

    const setup = this.botService.getSetup(guildId, channelId);
    if (!setup) {
      return interaction.reply({ content: 'No active setup found!', ephemeral: true });
    }

    const player = setup.players.find((p) => p.userId === interaction.user.id);
    if (!player || !player.weapons) {
      return interaction.reply({
        content: 'You are not in this setup or have not selected your first weapon!',
        ephemeral: true,
      });
    }

    player.weapons.push(weapon);
    this.botService.updateSetup(guildId, channelId, setup);

    // Build operator list excluding operators already taken by other players
    const takenByOthers = setup.players
      .filter((p) => p.userId !== interaction.user.id && p.operatorSkill)
      .map((p) => p.operatorSkill);

    const operatorOptions = OPERATOR_SKILLS
      .filter((op) => !takenByOthers.includes(op))
      .map((op) => ({
        label: this.truncateLabel(this.botService.formatWithEmoji(guildId, 'operator', op)),
        value: op,
      }));

    const w1 = this.botService.formatWithEmoji(guildId, 'weapon', player.weapons[0]);
    const w2 = this.botService.formatWithEmoji(guildId, 'weapon', weapon);

    await interaction.update({
      content:
        `✔ **Weapons:** ${w1} / ${w2}\n\n` +
        `Now select your **Operator Skill**:`,
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: 'select_operator_private',
              placeholder: 'Select Operator Skill',
              min_values: 1,
              max_values: 1,
              options:
                operatorOptions.length > 0
                  ? operatorOptions
                  : [{ label: 'No operators available', value: 'none' }],
            },
          ],
        },
      ],
    });
  }

  // ─── Step 4: Player picks operator → show lethal dropdown ───────────────────

  @StringSelect('select_operator_private')
  public async onSelectOperatorPrivate(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;
    const operatorName = selected[0];

    if (operatorName === 'none') {
      return interaction.reply({
        content: 'No operators are available — all have been taken by other players!',
        ephemeral: true,
      });
    }

    const setup = this.botService.getSetup(guildId, channelId);
    if (!setup) {
      return interaction.reply({ content: 'No active setup found!', ephemeral: true });
    }

    const player = setup.players.find((p) => p.userId === interaction.user.id);
    if (!player) {
      return interaction.reply({ content: 'You are not in this setup!', ephemeral: true });
    }

    if (!this.botService.canSelectOperator(setup, interaction.user.id, operatorName)) {
      return interaction.reply({
        content: `**${operatorName}** was just taken by another player. Please try again.`,
        ephemeral: true,
      });
    }

    player.operatorSkill = operatorName;
    this.botService.updateSetup(guildId, channelId, setup);

    const lethalOptions = LETHAL_EQUIPMENT.map((lethal) => ({
      label: this.truncateLabel(this.botService.formatWithEmoji(guildId, 'lethal', lethal)),
      value: lethal,
    }));

    const opLabel = this.botService.formatWithEmoji(guildId, 'operator', operatorName);

    await interaction.update({
      content:
        `✔ **Operator:** ${opLabel}\n\n` +
        `Now select your **Lethal Equipment**:`,
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: 'select_lethal_private',
              placeholder: 'Select Lethal Equipment',
              min_values: 1,
              max_values: 1,
              options: lethalOptions,
            },
          ],
        },
      ],
    });
  }

  // ─── Step 5: Player picks lethal → show tactical dropdown ───────────────────

  @StringSelect('select_lethal_private')
  public async onSelectLethalPrivate(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;
    const lethalName = selected[0];

    const setup = this.botService.getSetup(guildId, channelId);
    if (!setup) {
      return interaction.reply({ content: 'No active setup found!', ephemeral: true });
    }

    const player = setup.players.find((p) => p.userId === interaction.user.id);
    if (!player) {
      return interaction.reply({ content: 'You are not in this setup!', ephemeral: true });
    }

    player.lethal = lethalName;
    this.botService.updateSetup(guildId, channelId, setup);

    const tacticalOptions = TACTICAL_EQUIPMENT
      .map((tactical) => {
        const count = this.botService.getTacticalCount(setup, tactical);
        return {
          label: this.truncateLabel(this.botService.formatWithEmoji(guildId, 'tactical', tactical)),
          value: tactical,
          description: `${count}/3 used`,
          _count: count,
        };
      })
      .filter((t) => t._count < 3)
      .map(({ label, value, description }) => ({ label, value, description }));

    const lethalLabel = this.botService.formatWithEmoji(guildId, 'lethal', lethalName);

    await interaction.update({
      content:
        `✔ **Lethal:** ${lethalLabel}\n\n` +
        `Now select your **Tactical Equipment**:`,
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: 'select_tactical_private',
              placeholder: 'Select Tactical Equipment',
              min_values: 1,
              max_values: 1,
              options:
                tacticalOptions.length > 0
                  ? tacticalOptions
                  : [{ label: 'All tactical at max (3/3)', value: 'none' }],
            },
          ],
        },
      ],
    });
  }

  // ─── Step 6: Player picks tactical → player is done ─────────────────────────

  @StringSelect('select_tactical_private')
  public async onSelectTacticalPrivate(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;
    const tacticalName = selected[0];

    if (tacticalName === 'none') {
      return interaction.reply({
        content: 'No tactical equipment available — all types are at max capacity (3/3)!',
        ephemeral: true,
      });
    }

    const setup = this.botService.getSetup(guildId, channelId);
    if (!setup) {
      return interaction.reply({ content: 'No active setup found!', ephemeral: true });
    }

    const player = setup.players.find((p) => p.userId === interaction.user.id);
    if (!player) {
      return interaction.reply({ content: 'You are not in this setup!', ephemeral: true });
    }

    const currentCount = this.botService.getTacticalCount(setup, tacticalName);
    if (currentCount >= 3 && player.tactical !== tacticalName) {
      return interaction.reply({
        content: `**${tacticalName}** just reached max capacity (3/3). Please try again.`,
        ephemeral: true,
      });
    }

    player.tactical = tacticalName;
    this.botService.updateSetup(guildId, channelId, setup);

    // Show summary to the player in the ephemeral message
    const weaponsText = player.weapons?.join(' / ') ?? 'None';
    const tacLabel = this.botService.formatWithEmoji(guildId, 'tactical', tacticalName);

    await interaction.update({
      content:
        `✅ **Your setup is complete!**\n\n` +
        `**Roles:** ${player.role1} / ${player.role2}\n` +
        `**Weapons:** ${weaponsText}\n` +
        `**Operator:** ${player.operatorSkill}\n` +
        `**Lethal:** ${player.lethal}\n` +
        `**Tactical:** ${tacLabel}`,
      components: [],
    });

    // Update the shared channel message (progress or final roster)
    const message = await interaction.channel?.messages.fetch(setup.messageId!);
    if (message) {
      await this.checkAndFinalize(message, setup, guildId);
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  /** Rebuilds the progress embed on the shared channel message */
  private async updateMainEmbed(interaction: any, setup: any) {
    const message = await interaction.channel?.messages.fetch(setup.messageId!);
    if (!message) return;

    const statusEmoji = { waiting: '⏳', in_progress: '🔄', active: '✅', completed: '✔️' };
    const queueTime = setup.lastQueueTime?.toLocaleString() ?? new Date().toLocaleString();

    const embed = {
      color: EMBED_COLOR,
      title: `**Roster Setup ${statusEmoji[setup.status || 'waiting']} ${(setup.status ?? 'waiting').toUpperCase()}**`,
      description:
        setup.players
          .map((p) => {
            if (p.tactical) {
              return `**${p.role1}/${p.role2}**\n**<@${p.userId}> ✅ Complete**\n─────────────`;
            }
            if (p.role1 && p.role2 && p.weapons?.length >= 2) {
              return `**${p.role1}/${p.role2}**\n**<@${p.userId}> — selecting equipment…**\n─────────────`;
            }
            if (p.role1 && p.role2 && p.weapons?.length === 1) {
              return `**${p.role1}/${p.role2}**\n**<@${p.userId}> — ${p.weapons[0]} (1/2)**\n─────────────`;
            }
            if (p.role1 && p.role2) {
              return `**${p.role1}/${p.role2}**\n**<@${p.userId}> — selecting weapons…**\n─────────────`;
            }
            return `**Selecting…**\n**<@${p.userId}>**\n─────────────`;
          })
          .join('\n') +
        '\n\n' +
        this.botService.getRolePoolLines(setup) +
        `\n\n**Last Queue Date: ${queueTime}**`,
      footer: { text: 'COD Mobile Roster' },
      image: { url: BANNER_URL },
    };

    const components = [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'select_role_combination',
            placeholder: 'Select Role Combination',
            options: ROLE_COMBINATIONS.map((combo) => ({ label: combo, value: combo })),
          },
        ],
      },
      {
        type: 1,
        components: [
          { type: 2, style: 4, label: 'Leave', custom_id: 'leave_setup' },
          { type: 2, style: 2, label: 'Edit', custom_id: 'edit_roles' },
        ],
      },
      {
        type: 1,
        components: [{ type: 2, style: 3, label: '💡', custom_id: 'show_setup_steps' }],
      },
    ];

    await message.edit({ embeds: [embed], components });
  }

  /**
   * After a player completes their tactical pick, update the shared message.
   * If all players are fully done → show the final completed roster.
   * Otherwise → update the progress embed so others can see who's done.
   */
  private async checkAndFinalize(message: any, setup: any, guildId: string) {
    const requiredPlayers = this.botService.isTestMode() ? 1 : 5;
    const isComplete = (p: any) =>
      p.weapons?.length >= 2 && p.operatorSkill && p.lethal && p.tactical;

    const allDone =
      setup.players.length === requiredPlayers && setup.players.every(isComplete);

    if (!allDone) {
      // Show live progress on the shared message
      const queueTime = setup.lastQueueTime?.toLocaleString() ?? new Date().toLocaleString();
      const progressEmbed = {
        color: EMBED_COLOR,
        title: '**Roster Setup 🔄 IN PROGRESS**',
        description:
          setup.players
            .map((p) => {
              if (isComplete(p)) {
                return `**${p.role1}/${p.role2}**\n**<@${p.userId}> ✅ Complete**\n─────────────`;
              }
              if (p.role1 && p.role2 && p.weapons?.length >= 2) {
                return `**${p.role1}/${p.role2}**\n**<@${p.userId}> — selecting equipment…**\n─────────────`;
              }
              if (p.role1 && p.role2 && p.weapons?.length === 1) {
                return `**${p.role1}/${p.role2}**\n**<@${p.userId}> — ${p.weapons[0]} (1/2)**\n─────────────`;
              }
              if (p.role1 && p.role2) {
                return `**${p.role1}/${p.role2}**\n**<@${p.userId}> — selecting weapons…**\n─────────────`;
              }
              return `**Selecting…**\n**<@${p.userId}>**\n─────────────`;
            })
            .join('\n') +
          '\n\n' +
          this.botService.getRolePoolLines(setup) +
          `\n\n**Last Queue Date: ${queueTime}**`,
        footer: { text: 'COD Mobile Roster' },
        image: { url: BANNER_URL },
      };

      const progressComponents = [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: 'select_role_combination',
              placeholder: 'Select Role Combination',
              options: ROLE_COMBINATIONS.map((combo) => ({ label: combo, value: combo })),
            },
          ],
        },
        {
          type: 1,
          components: [
            { type: 2, style: 4, label: 'Leave', custom_id: 'leave_setup' },
            { type: 2, style: 2, label: 'Edit', custom_id: 'edit_roles' },
          ],
        },
        {
          type: 1,
          components: [{ type: 2, style: 3, label: '💡', custom_id: 'show_setup_steps' }],
        },
      ];

      await message.edit({ embeds: [progressEmbed], components: progressComponents });
      return;
    }

    // ── All 5 players done — show completed roster ────────────────────────────
    setup.status = 'completed';
    this.botService.updateSetup(guildId, setup.channelId, setup);

    const queueTime = setup.lastQueueTime?.toLocaleString() ?? new Date().toLocaleString();

    const playersList = setup.players
      .map((p, i) => {
        const weapons = p.weapons?.join(' / ') ?? 'None';
        return (
          `**Player ${i + 1}: <@${p.userId}>**\n` +
          `**Roles: ${p.role1} / ${p.role2}**\n` +
          `**Weapons: ${weapons}**\n` +
          `**Operator: ${p.operatorSkill}**\n` +
          `**Equipment: ${p.lethal} | ${p.tactical}**`
        );
      })
      .join('\n\n─────────────────────────────\n\n');

    const finalEmbed = {
      color: EMBED_COLOR,
      title: '**✅ Roster Setup COMPLETED**',
      description:
        '**Your team configuration is complete!**\n\n' +
        playersList +
        '\n\n**Setup Complete — Ready for Tournament!**' +
        `\n\n**Last Queue Date: ${queueTime}**`,
      footer: { text: 'COD Mobile Esports' },
      image: { url: BANNER_URL },
    };

    await message.edit({
      embeds: [finalEmbed],
      components: [
        {
          type: 1,
          components: [
            { type: 2, style: 2, label: 'Start New Setup', custom_id: 'new_setup' },
          ],
        },
      ],
    });

    // Send roster log
    const logText = setup.players
      .map((p, i) => {
        const weapons = p.weapons?.join(', ') ?? 'None';
        return (
          `Player ${i + 1}: <@${p.userId}>\n` +
          `Roles: ${p.role1} / ${p.role2}\n` +
          `Weapons: ${weapons}\n` +
          `Operator: ${p.operatorSkill}\n` +
          `Equipment: ${p.lethal} | ${p.tactical}`
        );
      })
      .join('\n\n');

    this.botService.sendLog(guildId, `[ROSTER COMPLETE]\n\n${logText}`);
  }
}
