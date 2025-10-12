import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext, Options, RoleOption } from 'necord';
import { Role, PermissionFlagsBits } from 'discord.js';
import { BotService } from '../bot.service';
import { EMBED_COLOR } from '../../constants/game-data';

class SetManagerRoleDto {
  @RoleOption({
    name: 'role',
    description: 'Role that can start new setups',
    required: true,
  })
  role: Role;
}

@Injectable()
export class SetManagerRoleCommand {
  constructor(private readonly botService: BotService) {}

  @SlashCommand({
    name: 'setmanagerrole',
    description: 'Set the role that can start new roster setups',
    dmPermission: false,
    defaultMemberPermissions: [PermissionFlagsBits.ManageGuild],
  })
  async onSetManagerRole(
    @Context() [interaction]: SlashCommandContext,
    @Options() { role }: SetManagerRoleDto,
  ) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({
        content: 'This command can only be used in a server!',
        ephemeral: true,
      });
    }

    this.botService.setManagerRole(guildId, role.id);

    const embed = {
      color: EMBED_COLOR,
      title: 'Manager Role Set',
      description: `${role} has been set as the manager role.\n\nOnly users with this role can start new roster setups.`,
    };

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
