import { Injectable, UseInterceptors } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext, Options, StringOption, AutocompleteInterceptor } from 'necord';
import { AutocompleteInteraction } from 'discord.js';
import { BotService } from '../bot.service';
import { EMBED_COLOR } from '../../constants/game-data';
import { getWeaponListsForCategory, CATEGORY_MAPPING } from '../../constants/weapon-lists';

class SetGunsMenuDto {
  @StringOption({
    name: 'category',
    description: 'Gun category name (AR, SMG, Marksman, Heavy, Sniper, LMG, Shotgun, Pistol)',
    required: true,
    autocomplete: true,
  })
  category: string;

  @StringOption({ name: 'list1', description: '1st 24 guns for category', required: false, autocomplete: true })
  list1?: string;

  @StringOption({ name: 'list2', description: '2nd 24 guns for category', required: false, autocomplete: true })
  list2?: string;

  @StringOption({ name: 'list3', description: '3rd 24 guns for category', required: false, autocomplete: true })
  list3?: string;

  @StringOption({ name: 'list4', description: '4th 24 guns for category', required: false, autocomplete: true })
  list4?: string;

  @StringOption({ name: 'list5', description: '5th 24 guns for category', required: false, autocomplete: true })
  list5?: string;

  @StringOption({ name: 'list6', description: '6th 24 guns for category', required: false, autocomplete: true })
  list6?: string;

  @StringOption({ name: 'list7', description: '7th 24 guns for category', required: false, autocomplete: true })
  list7?: string;

  @StringOption({ name: 'list8', description: '8th 24 guns for category', required: false, autocomplete: true })
  list8?: string;

  @StringOption({ name: 'list9', description: '9th 24 guns for category', required: false, autocomplete: true })
  list9?: string;

  @StringOption({ name: 'list10', description: '10th 24 guns for category', required: false, autocomplete: true })
  list10?: string;

  @StringOption({ name: 'list11', description: '11th 24 guns for category', required: false, autocomplete: true })
  list11?: string;

  @StringOption({ name: 'list12', description: '12th 24 guns for category', required: false, autocomplete: true })
  list12?: string;

  @StringOption({ name: 'list13', description: '13th 24 guns for category', required: false, autocomplete: true })
  list13?: string;

  @StringOption({ name: 'list14', description: '14th 24 guns for category', required: false, autocomplete: true })
  list14?: string;

  @StringOption({ name: 'list15', description: '15th 24 guns for category', required: false, autocomplete: true })
  list15?: string;

  @StringOption({ name: 'list16', description: '16th 24 guns for category', required: false, autocomplete: true })
  list16?: string;

  @StringOption({ name: 'list17', description: '17th 24 guns for category', required: false, autocomplete: true })
  list17?: string;

  @StringOption({ name: 'list18', description: '18th 24 guns for category', required: false, autocomplete: true })
  list18?: string;

  @StringOption({ name: 'list19', description: '19th 24 guns for category', required: false, autocomplete: true })
  list19?: string;

  @StringOption({ name: 'list20', description: '20th 24 guns for category', required: false, autocomplete: true })
  list20?: string;

  @StringOption({ name: 'list21', description: '21st 24 guns for category', required: false, autocomplete: true })
  list21?: string;

  @StringOption({ name: 'list22', description: '22nd 24 guns for category', required: false, autocomplete: true })
  list22?: string;

  @StringOption({ name: 'list23', description: '23rd 24 guns for category', required: false, autocomplete: true })
  list23?: string;

  @StringOption({ name: 'list24', description: '24th 24 guns for category', required: false, autocomplete: true })
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
export class CategoryAutocompleteInterceptor extends AutocompleteInterceptor {
  public transformOptions(interaction: AutocompleteInteraction) {
    const focused = interaction.options.getFocused(true);
    const categories = ['AR', 'SMG', 'Marksman', 'Heavy', 'Sniper', 'LMG', 'Shotgun', 'Pistol'];
    
    if (focused.name === 'category') {
      const searchValue = focused.value.toString().toLowerCase();
      const filtered = searchValue === '' 
        ? categories 
        : categories.filter(cat => cat.toLowerCase().includes(searchValue));
      
      return interaction.respond(
        filtered.slice(0, 25).map(cat => ({ name: cat, value: cat }))
      );
    }
    
    // Handle list autocomplete - show ALL available lists for the category
    if (focused.name.startsWith('list')) {
      const category = interaction.options.getString('category');
      
      if (category) {
        const weaponLists = getWeaponListsForCategory(category);
        
        if (weaponLists.length > 0) {
          // Show all available lists for this category
          const options = weaponLists.map((fullList, index) => {
            const listNumber = index + 1;
            const gunCount = fullList.split(', ').length;
            const shortValue = `${category.toUpperCase()}_LIST_${listNumber}`;
            const displayName = `${category} - List ${listNumber} (${gunCount} guns)`;
            
            // Ensure name doesn't exceed 100 chars
            const truncatedName = displayName.length > 100 
              ? displayName.substring(0, 97) + '...' 
              : displayName;
            
            return { name: truncatedName, value: shortValue };
          });
          
          return interaction.respond(options.slice(0, 25));
        }
      }
    }
    
    return interaction.respond([]);
  }
}

@Injectable()
export class SetGunsMenuCommand {
  constructor(private readonly botService: BotService) {}

  @UseInterceptors(CategoryAutocompleteInterceptor)
  @SlashCommand({
    name: 'setgunsmenu',
    description: 'Create gun selection menu for a category (shows all guns as options)',
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

    // Helper function to resolve list identifiers to actual weapon lists
    const resolveList = (listValue: string): string => {
      // Check if it's a short identifier (e.g., "AR_LIST_1")
      const pattern = /^([A-Z]+)_LIST_(\d+)$/;
      const match = listValue.match(pattern);
      
      if (match) {
        const [, category, listNum] = match;
        const weaponLists = getWeaponListsForCategory(category);
        const listIndex = parseInt(listNum) - 1;
        return weaponLists[listIndex] || listValue;
      }
      
      // Otherwise, treat as custom comma-separated list
      return listValue;
    };

    // Collect all list options and resolve them
    const rawLists = [
      options.list1, options.list2, options.list3, options.list4, options.list5,
      options.list6, options.list7, options.list8, options.list9, options.list10,
      options.list11, options.list12, options.list13, options.list14, options.list15,
      options.list16, options.list17, options.list18, options.list19, options.list20,
      options.list21, options.list22, options.list23, options.list24,
    ].filter((list): list is string => list !== undefined && list !== null && list.trim().length > 0);
    
    const lists = rawLists.map(resolveList);

    if (lists.length === 0) {
      // Auto-load ALL guns for the category
      const weaponLists = getWeaponListsForCategory(options.category);
      
      if (weaponLists.length > 0) {
        // Combine all lists for this category
        lists.push(...weaponLists);
      } else {
        return interaction.reply({
          content: `❌ No weapons found for category: ${options.category}`,
          ephemeral: true,
        });
      }
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

    // Create select menus - split into chunks of 25 if needed
    const menuChunks: string[][] = [];
    for (let i = 0; i < allowedGuns.length; i += 25) {
      menuChunks.push(allowedGuns.slice(i, i + 25));
    }

    // Send each menu as a separate message
    for (let i = 0; i < menuChunks.length; i++) {
      const chunk = menuChunks[i];
      const menuNumber = menuChunks.length > 1 ? ` (Menu ${i + 1}/${menuChunks.length})` : '';
      
      const selectMenuOptions = chunk.map(gun => ({
        label: gun.length > 100 ? gun.substring(0, 97) + '...' : gun,
        value: gun,
      }));

      const components = [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: `custom_gun_select_${options.category.toLowerCase().replace(/\s+/g, '_')}_${i + 1}`,
              placeholder: `Select weapon(s) from ${options.category}${menuNumber}`,
              min_values: 1,
              max_values: chunk.length,
              options: selectMenuOptions,
            },
          ],
        },
      ];

      const embed = {
        color: EMBED_COLOR,
        title: `${options.category} - Guns Menu${menuNumber}`,
        description: `**Available Guns (Multi-Select):**\n${chunk.join(', ')}`,
        footer: { text: `${chunk.length} guns in this menu | Total: ${allowedGuns.length} guns` },
      };

      await interaction.channel.send({
        embeds: [embed],
        components,
      });
    }

    const confirmEmbed = {
      color: EMBED_COLOR,
      title: '✅ Custom Guns Menu Created',
      description: `Category: **${options.category}**\nGuns added: **${allowedGuns.length}**\nMenus created: **${menuChunks.length}**\nMulti-select: **Enabled**`,
    };

    return interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
  }
}
