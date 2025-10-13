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
      title: 'COD Mobile Roster Setup',
      description:
        '**Gun Roles:**\n' +
        '**AR** 0/3\n' +
        '**SMG** 0/3\n' +
        '**Marksman** 0/2\n' +
        '**Heavy** 0/2',
      footer: { text: '5 Players Required' },
    };

    const components = [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'select_role_combination',
            placeholder: 'Select Role Combination',
            options: [
              { label: 'AR/SMG', value: 'AR/SMG' },
              { label: 'AR/Marksman', value: 'AR/Marksman' },
              { label: 'AR/Heavy', value: 'AR/Heavy' },
              { label: 'SMG/AR', value: 'SMG/AR' },
              { label: 'SMG/Marksman', value: 'SMG/Marksman' },
              { label: 'SMG/Heavy', value: 'SMG/Heavy' },
              { label: 'Marksman/AR', value: 'Marksman/AR' },
              { label: 'Marksman/SMG', value: 'Marksman/SMG' },
              { label: 'Marksman/Heavy', value: 'Marksman/Heavy' },
              { label: 'Heavy/SMG', value: 'Heavy/SMG' },
              { label: 'Heavy/AR', value: 'Heavy/AR' },
              { label: 'Heavy/Marksman', value: 'Heavy/Marksman' },
            ],
          },
        ],
      },
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
          {
            type: 2,
            style: 2,
            label: 'Edit',
            custom_id: 'edit_roles',
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 3,
            label: '💡',
            custom_id: 'show_setup_steps',
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
