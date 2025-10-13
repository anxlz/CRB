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

  @StringOption({ name: 'list1', description: 'Comma-separated guns list 1', required: false })
  list1?: string;

  @StringOption({ name: 'list2', description: 'Comma-separated guns list 2', required: false })
  list2?: string;

  @StringOption({ name: 'list3', description: 'Comma-separated guns list 3', required: false })
  list3?: string;

  @StringOption({ name: 'list4', description: 'Comma-separated guns list 4', required: false })
  list4?: string;

  @StringOption({ name: 'list5', description: 'Comma-separated guns list 5', required: false })
  list5?: string;

  @StringOption({ name: 'list6', description: 'Comma-separated guns list 6', required: false })
  list6?: string;

  @StringOption({ name: 'list7', description: 'Comma-separated guns list 7', required: false })
  list7?: string;

  @StringOption({ name: 'list8', description: 'Comma-separated guns list 8', required: false })
  list8?: string;

  @StringOption({ name: 'list9', description: 'Comma-separated guns list 9', required: false })
  list9?: string;

  @StringOption({ name: 'list10', description: 'Comma-separated guns list 10', required: false })
  list10?: string;

  @StringOption({ name: 'list11', description: 'Comma-separated guns list 11', required: false })
  list11?: string;

  @StringOption({ name: 'list12', description: 'Comma-separated guns list 12', required: false })
  list12?: string;

  @StringOption({ name: 'list13', description: 'Comma-separated guns list 13', required: false })
  list13?: string;

  @StringOption({ name: 'list14', description: 'Comma-separated guns list 14', required: false })
  list14?: string;

  @StringOption({ name: 'list15', description: 'Comma-separated guns list 15', required: false })
  list15?: string;

  @StringOption({ name: 'list16', description: 'Comma-separated guns list 16', required: false })
  list16?: string;

  @StringOption({ name: 'list17', description: 'Comma-separated guns list 17', required: false })
  list17?: string;

  @StringOption({ name: 'list18', description: 'Comma-separated guns list 18', required: false })
  list18?: string;

  @StringOption({ name: 'list19', description: 'Comma-separated guns list 19', required: false })
  list19?: string;

  @StringOption({ name: 'list20', description: 'Comma-separated guns list 20', required: false })
  list20?: string;

  @StringOption({ name: 'list21', description: 'Comma-separated guns list 21', required: false })
  list21?: string;

  @StringOption({ name: 'list22', description: 'Comma-separated guns list 22', required: false })
  list22?: string;

  @StringOption({ name: 'list23', description: 'Comma-separated guns list 23', required: false })
  list23?: string;

  @StringOption({ name: 'list24', description: 'Comma-separated guns list 24', required: false })
  list24?: string;
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

// Pre-organized gun lists by category (excluding banned guns)
export const GUN_LISTS = {
  AR: [
    'M4,AK117,AK-47,Type 25,ASM10,BK57,LK24,M16,ICR-1,Man-O-War',
    'HBRa3,KN-44,HVK-30,DR-H,Peacekeeper MK2,FR .556,AS VAL,CR-56 AMAX,M13,Swordfish',
    'Kilo 141,Oden,Krig 6,EM2,Maddox,FFAR 1,Grau 5.56,Groza,Type 19,BP50',
    'LAG 53,XM4,Vargo-S,RAM-7'
  ],
  SMG: [
    'RUS-79U,PDW-57,HG 40,Chicom,MSMC,Razorback,Pharo,GKS,Cordite,QQ9',
    'Fennec,AGR 556,QXR,PP19 Bizon,MX9,CBR4,PPSh-41,MAC-10,KSP 45,Switchblade X9',
    'LAPA,OTs 9,Striker 45,CX-9,TEC-9,ISO,USS 9,VMP,Sten'
  ],
  SNIPER: [
    'DL Q33,M21 EBR,Arctic .50,Locus,Outlaw,Rytec AMR,Koshka,ZRG 20mm,HDR,LW3-Tundra',
    '3-Line Rifle'
  ],
  LMG: [
    'RPD,M4LMG,UL736,S36,Chopper,Holger 26,Hades,PKM,Dingo,Bruen MK9',
    'MG42,RAAL MG,MG 82'
  ],
  SHOTGUN: [
    'BY15,Striker,HS2126,HS0405,KRM-262,Echo,R9-0,JAK-12,VLK Rogue,Einhorn Revolving'
  ],
  MARKSMAN: [
    'Kilo Bolt-Action,SKS,SP-R 208,MK2,Type 63,M1 Garand,SO-14'
  ],
  PISTOL: [
    'MW11,J358,.50 GS,Renetti,Crossbow,L-CAR 9,Dobvra,Nail Gun,Machine Pistol'
  ]
};

@Injectable()
export class SetGunsMenuCommand {
  constructor(private readonly botService: BotService) {}

  @SlashCommand({
    name: 'setgunsmenu',
    description: 'Set custom guns menu with category (supports multiple lists)',
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

    // Collect all list options
    const lists = [
      options.list1, options.list2, options.list3, options.list4, options.list5,
      options.list6, options.list7, options.list8, options.list9, options.list10,
      options.list11, options.list12, options.list13, options.list14, options.list15,
      options.list16, options.list17, options.list18, options.list19, options.list20,
      options.list21, options.list22, options.list23, options.list24,
    ].filter((list): list is string => list !== undefined && list !== null && list.trim().length > 0);

    if (lists.length === 0) {
      // Show help message with pre-configured gun lists
      const categoryUpper = options.category.toUpperCase();
      const availableLists = GUN_LISTS[categoryUpper as keyof typeof GUN_LISTS];
      
      if (availableLists) {
        const listsInfo = availableLists
          .map((list, index) => `**list${index + 1}:** ${list.split(',').length} guns`)
          .join('\n');
        
        return interaction.reply({
          content: `ℹ️ **Available pre-configured lists for ${options.category}:**\n\n${listsInfo}\n\n**Example usage:**\n\`/setgunsmenu category:${options.category} list1:${availableLists[0].substring(0, 50)}...\`\n\nOr use all lists:\n\`/setgunsmenu category:${options.category} list1:... list2:... list3:...\``,
          ephemeral: true,
        });
      }
      
      return interaction.reply({
        content: '❌ No gun lists provided! Please add at least one list with comma-separated guns.',
        ephemeral: true,
      });
    }

    // Parse all guns from all lists
    const allGuns: string[] = [];
    for (const list of lists) {
      const gunsInList = list
        .split(',')
        .map(gun => gun.trim())
        .filter(gun => gun.length > 0);
      allGuns.push(...gunsInList);
    }

    if (allGuns.length === 0) {
      return interaction.reply({
        content: '❌ No valid guns found in the provided lists!',
        ephemeral: true,
      });
    }

    // Filter out banned guns
    const allowedGuns = allGuns.filter(gun => !BANNED_GUNS.includes(gun));
    const bannedGunsFound = allGuns.filter(gun => BANNED_GUNS.includes(gun));

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

    // Create multi-select menu (up to 25 options)
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
            placeholder: `Select weapon(s) from ${options.category}`,
            min_values: 1,
            max_values: Math.min(allowedGuns.length, 25),
            options: selectMenuOptions,
          },
        ],
      },
    ];

    const embed = {
      color: EMBED_COLOR,
      title: `${options.category} - Custom Guns Menu`,
      description: `**Available Guns (Multi-Select):**\n${allowedGuns.join(', ')}`,
      footer: { text: `Total: ${allowedGuns.length} guns | Multi-select enabled` },
    };

    await interaction.channel.send({
      embeds: [embed],
      components,
    });

    const confirmEmbed = {
      color: EMBED_COLOR,
      title: '✅ Custom Guns Menu Created',
      description: `Category: **${options.category}**\nGuns added: **${allowedGuns.length}**\nMulti-select: **Enabled**`,
    };

    return interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
  }
}
