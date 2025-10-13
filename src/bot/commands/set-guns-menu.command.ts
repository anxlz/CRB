import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext, Options, StringOption } from 'necord';
import { BotService } from '../bot.service';
import { EMBED_COLOR } from '../../constants/game-data';

class SetGunsMenuDto {
  @StringOption({
    name: 'category',
    description: 'Gun category name',
    required: true,
  })
  category: string;

  @StringOption({
    name: 'guns',
    description: 'Comma-separated list of guns (e.g. M4,AK-47,ICR-1)',
    required: true,
  })
  guns: string;
}

const BANNED_GUNS = [
  'NA-45',
  'SVD',
  'XPR-50',
  'XPR',
  'Thumper',
  'Shorty',
  'SMRS',
  'FHJ-18',
  'Argus',
  'D13 Sector'
];

@Injectable()
export class SetGunsMenuCommand {
  constructor(private readonly botService: BotService) {}

  @SlashCommand({
    name: 'setgunsmenu',
    description: 'Set custom guns menu with category (up to 25 guns)',
  })
  async onSetGunsMenu(
    @Context() [interaction]: SlashCommandContext,
    @Options() options: SetGunsMenuDto,
  ) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({
        content: 'This command can only be used in a server!',
        ephemeral: true,
      });
    }

    // Parse comma-separated guns list
    const guns = options.guns
      .split(',')
      .map(gun => gun.trim())
      .filter(gun => gun.length > 0);

    // Filter out banned guns
    const allowedGuns = guns.filter(gun => !BANNED_GUNS.includes(gun));
    const bannedGunsFound = guns.filter(gun => BANNED_GUNS.includes(gun));

    if (bannedGunsFound.length > 0) {
      return interaction.reply({
        content: `❌ The following guns are banned and cannot be added: ${bannedGunsFound.join(', ')}\n\nPlease use the command again without these guns.`,
        ephemeral: true,
      });
    }

    if (allowedGuns.length === 0) {
      return interaction.reply({
        content: '❌ No valid guns provided!',
        ephemeral: true,
      });
    }

    // Create the select menu
    const selectMenuOptions = allowedGuns.slice(0, 25).map(gun => ({
      label: gun,
      value: gun,
    }));

    const components = [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: `custom_gun_select_${options.category.toLowerCase().replace(/\s+/g, '_')}`,
            placeholder: `Select weapon from ${options.category}`,
            options: selectMenuOptions,
          },
        ],
      },
    ];

    const embed = {
      color: EMBED_COLOR,
      title: `${options.category} - Custom Guns Menu`,
      description: `**Available Guns:**\n${allowedGuns.join('\n')}`,
      footer: { text: `Total: ${allowedGuns.length} guns` },
    };

    await interaction.channel.send({
      embeds: [embed],
      components,
    });

    const confirmEmbed = {
      color: EMBED_COLOR,
      title: '✅ Custom Guns Menu Created',
      description: `Category: **${options.category}**\nGuns added: **${allowedGuns.length}**`,
    };

    return interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
  }
}
