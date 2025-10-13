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

  @StringOption({ name: 'gun1', description: 'Gun 1', required: false })
  gun1?: string;

  @StringOption({ name: 'gun2', description: 'Gun 2', required: false })
  gun2?: string;

  @StringOption({ name: 'gun3', description: 'Gun 3', required: false })
  gun3?: string;

  @StringOption({ name: 'gun4', description: 'Gun 4', required: false })
  gun4?: string;

  @StringOption({ name: 'gun5', description: 'Gun 5', required: false })
  gun5?: string;

  @StringOption({ name: 'gun6', description: 'Gun 6', required: false })
  gun6?: string;

  @StringOption({ name: 'gun7', description: 'Gun 7', required: false })
  gun7?: string;

  @StringOption({ name: 'gun8', description: 'Gun 8', required: false })
  gun8?: string;

  @StringOption({ name: 'gun9', description: 'Gun 9', required: false })
  gun9?: string;

  @StringOption({ name: 'gun10', description: 'Gun 10', required: false })
  gun10?: string;

  @StringOption({ name: 'gun11', description: 'Gun 11', required: false })
  gun11?: string;

  @StringOption({ name: 'gun12', description: 'Gun 12', required: false })
  gun12?: string;

  @StringOption({ name: 'gun13', description: 'Gun 13', required: false })
  gun13?: string;

  @StringOption({ name: 'gun14', description: 'Gun 14', required: false })
  gun14?: string;

  @StringOption({ name: 'gun15', description: 'Gun 15', required: false })
  gun15?: string;

  @StringOption({ name: 'gun16', description: 'Gun 16', required: false })
  gun16?: string;

  @StringOption({ name: 'gun17', description: 'Gun 17', required: false })
  gun17?: string;

  @StringOption({ name: 'gun18', description: 'Gun 18', required: false })
  gun18?: string;

  @StringOption({ name: 'gun19', description: 'Gun 19', required: false })
  gun19?: string;

  @StringOption({ name: 'gun20', description: 'Gun 20', required: false })
  gun20?: string;

  @StringOption({ name: 'gun21', description: 'Gun 21', required: false })
  gun21?: string;

  @StringOption({ name: 'gun22', description: 'Gun 22', required: false })
  gun22?: string;

  @StringOption({ name: 'gun23', description: 'Gun 23', required: false })
  gun23?: string;

  @StringOption({ name: 'gun24', description: 'Gun 24', required: false })
  gun24?: string;
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
    description: 'Set custom guns menu with category (up to 24 guns)',
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

    // Collect all gun options into an array
    const guns = [
      options.gun1, options.gun2, options.gun3, options.gun4, options.gun5,
      options.gun6, options.gun7, options.gun8, options.gun9, options.gun10,
      options.gun11, options.gun12, options.gun13, options.gun14, options.gun15,
      options.gun16, options.gun17, options.gun18, options.gun19, options.gun20,
      options.gun21, options.gun22, options.gun23, options.gun24,
    ]
      .filter((gun): gun is string => gun !== undefined && gun !== null && gun.trim().length > 0)
      .map(gun => gun.trim());

    if (guns.length === 0) {
      return interaction.reply({
        content: '❌ No guns provided! Please add at least one gun.',
        ephemeral: true,
      });
    }

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
        content: '❌ No valid guns provided after filtering banned weapons!',
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
