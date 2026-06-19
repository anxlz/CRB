import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext, Options, ChannelOption } from 'necord';
import { Channel } from 'discord.js';
import { BotService } from '../bot.service';
import { EMBED_COLOR, ROLE_COMBINATIONS } from '../../constants/game-data';

const BANNER_URL =
  'https://media.discordapp.net/attachments/1413190110694084789/1430281339231277066/bwDlFcd.png?ex=68f9dd8c&is=68f88c0c&hm=07f8d5ab727cce9b9122a8a17ecbc9dd53425a229cb9f666ad05dd112221194d&=&format=png&quality=lossless&width=400&height=63';

class SendSetupDto {
  @ChannelOption({ name: 'channel', description: 'Channel to send setup message to', required: true })
  channel: Channel;
}

@Injectable()
export class SendSetupCommand {
  constructor(private readonly botService: BotService) {}

  @SlashCommand({
    name: 'sendsetup',
    description: 'Manually send a setup message to a specified channel',
  })
  async onSendSetup(
    @Context() [interaction]: SlashCommandContext,
    @Options() { channel }: SendSetupDto,
  ) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
    }

    const existingSetup = this.botService.getSetup(guildId, channel.id);
    const queueTime = existingSetup?.lastQueueTime
      ? existingSetup.lastQueueTime.toLocaleString()
      : new Date().toLocaleString();

    const setupChannelEmbed = {
      color: EMBED_COLOR,
      title: '**COD Mobile Roster Setup**',
      description:
        '**Gun Roles:**\n' +
        '**0/3 SMG**\n' +
        '**0/3 AR**\n' +
        '**0/1 Sniper**\n' +
        '**0/1 Shotgun**\n' +
        '**0/1 Marksman**\n' +
        '**0/1 LMG**\n\n' +
        `**Last Queue Date: ${queueTime}**`,
      footer: { text: '5 Players Required' },
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

    if ('send' in channel && typeof channel.send === 'function') {
      const sentMessage = await channel.send({ embeds: [setupChannelEmbed], components });
      this.botService.setSetupMessageId(guildId, channel.id, sentMessage.id);

      const embed = {
        color: EMBED_COLOR,
        title: '**Setup Message Sent**',
        description: `**Setup message has been sent to ${channel}**`,
        image: { url: BANNER_URL },
      };
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      return interaction.reply({ content: 'The selected channel cannot receive messages!', ephemeral: true });
    }
  }
}
