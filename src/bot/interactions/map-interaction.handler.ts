import { Injectable } from '@nestjs/common';
import { Context, Button, ButtonContext } from 'necord';
import { BotService } from '../bot.service';
import { EMBED_COLOR } from '../../constants/game-data';

@Injectable()
export class MapInteractionHandler {
  constructor(private readonly botService: BotService) {}


  @Button('new_setup')
  public async onNewSetup(@Context() [interaction]: ButtonContext) {
    const guildId = interaction.guildId!;
    const channelId = interaction.channelId;

    const managerRoleId = this.botService.getManagerRole(guildId);
    if (managerRoleId) {
      const memberRoles = interaction.member?.roles;
      const hasRole = Array.isArray(memberRoles) 
        ? memberRoles.includes(managerRoleId)
        : memberRoles?.cache?.has(managerRoleId);
      
      if (!hasRole) {
        return interaction.reply({
          content: 'You do not have permission to start a new setup. Only users with the manager role can do this.',
          ephemeral: true,
        });
      }
    }

    this.botService.resetSetup(guildId, channelId);

    const setupChannelEmbed = {
      color: EMBED_COLOR,
      title: 'Roster Setup',
      description:
        'This is the start of the Queue channel.\n\n' +
        'War Machine/Gravity Spikes 0/2\n' +
        'Equalizer/Purifier 0/2\n' +
        'Death Machine/Gravity Vortex 0/2\n' +
        'Sparrow/Claw 0/2\n' +
        'Annihilator/Tempest 0/2',
      footer: { text: 'COD Mobile Roster' },
    };

    const components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 1,
            label: 'Join',
            custom_id: 'join_setup',
          },
          {
            type: 2,
            style: 4,
            label: 'Leave',
            custom_id: 'leave_setup',
          },
        ],
      },
    ];

    await interaction.update({
      embeds: [setupChannelEmbed],
      components,
    });
  }
}
