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
    name: 'gun1',
    description: 'First gun',
    required: true,
  })
  gun1: string;

  @StringOption({
    name: 'gun2',
    description: 'Second gun (optional)',
    required: false,
  })
  gun2?: string;

  @StringOption({
    name: 'gun3',
    description: 'Third gun (optional)',
    required: false,
  })
  gun3?: string;

  @StringOption({
    name: 'gun4',
    description: 'Fourth gun (optional)',
    required: false,
  })
  gun4?: string;

  @StringOption({
    name: 'gun5',
    description: 'Fifth gun (optional)',
    required: false,
  })
  gun5?: string;

  @StringOption({
    name: 'gun6',
    description: 'Sixth gun (optional)',
    required: false,
  })
  gun6?: string;

  @StringOption({
    name: 'gun7',
    description: 'Seventh gun (optional)',
    required: false,
  })
  gun7?: string;

  @StringOption({
    name: 'gun8',
    description: 'Eighth gun (optional)',
    required: false,
  })
  gun8?: string;

  @StringOption({
    name: 'gun9',
    description: 'Ninth gun (optional)',
    required: false,
  })
  gun9?: string;

  @StringOption({
    name: 'gun10',
    description: 'Tenth gun (optional)',
    required: false,
  })
  gun10?: string;

  @StringOption({
    name: 'gun11',
    description: 'Eleventh gun (optional)',
    required: false,
  })
  gun11?: string;

  @StringOption({
    name: 'gun12',
    description: 'Twelfth gun (optional)',
    required: false,
  })
  gun12?: string;

  @StringOption({
    name: 'gun13',
    description: 'Thirteenth gun (optional)',
    required: false,
  })
  gun13?: string;

  @StringOption({
    name: 'gun14',
    description: 'Fourteenth gun (optional)',
    required: false,
  })
  gun14?: string;

  @StringOption({
    name: 'gun15',
    description: 'Fifteenth gun (optional)',
    required: false,
  })
  gun15?: string;

  @StringOption({
    name: 'gun16',
    description: 'Sixteenth gun (optional)',
    required: false,
  })
  gun16?: string;

  @StringOption({
    name: 'gun17',
    description: 'Seventeenth gun (optional)',
    required: false,
  })
  gun17?: string;

  @StringOption({
    name: 'gun18',
    description: 'Eighteenth gun (optional)',
    required: false,
  })
  gun18?: string;

  @StringOption({
    name: 'gun19',
    description: 'Nineteenth gun (optional)',
    required: false,
  })
  gun19?: string;

  @StringOption({
    name: 'gun20',
    description: 'Twentieth gun (optional)',
    required: false,
  })
  gun20?: string;

  @StringOption({
    name: 'gun21',
    description: 'Twenty-first gun (optional)',
    required: false,
  })
  gun21?: string;

  @StringOption({
    name: 'gun22',
    description: 'Twenty-second gun (optional)',
    required: false,
  })
  gun22?: string;

  @StringOption({
    name: 'gun23',
    description: 'Twenty-third gun (optional)',
    required: false,
  })
  gun23?: string;

  @StringOption({
    name: 'gun24',
    description: 'Twenty-fourth gun (optional)',
    required: false,
  })
  gun24?: string;

  @StringOption({
    name: 'gun25',
    description: 'Twenty-fifth gun (optional)',
    required: false,
  })
  gun25?: string;
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

    const guns = [
      options.gun1, options.gun2, options.gun3, options.gun4, options.gun5,
      options.gun6, options.gun7, options.gun8, options.gun9, options.gun10,
      options.gun11, options.gun12, options.gun13, options.gun14, options.gun15,
      options.gun16, options.gun17, options.gun18, options.gun19, options.gun20,
      options.gun21, options.gun22, options.gun23, options.gun24, options.gun25,
    ].filter((gun): gun is string => gun !== undefined && gun !== null);

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
