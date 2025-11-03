import { Injectable, Logger } from '@nestjs/common';
import { Context, Options, SlashCommand, Button } from 'necord';
import type { SlashCommandContext, ButtonContext } from 'necord';
import { RoomService } from 'src/core/room/room.service';
import { GameService } from 'src/core/game/game.service';
import { UserService } from 'src/core/user/user.service';
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { SkipThrottle } from '@nestjs/throttler';
import { RoomCreateOptionsDto } from '../dto';

@SkipThrottle()
@Injectable()
export class RoomCommands {
  private readonly logger = new Logger(RoomCommands.name);

  constructor(
    private readonly roomService: RoomService,
    private readonly gameService: GameService,
    private readonly userService: UserService,
  ) {}

  @SlashCommand({
    name: 'room',
    description: 'Create a new game room',
  })
  async onCreate(
    @Context() [interaction]: SlashCommandContext,
    @Options() options: RoomCreateOptionsDto,
  ) {
    try {
      await interaction.deferReply();

      // Authenticate or create user from Discord
      const user = await this.userService.findOrCreateByDiscord({
        discordId: interaction.user.id,
        username: interaction.user.username,
        discriminator: interaction.user.discriminator || '0',
        // avatar: interaction.user.avatar
        //   ? `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`
        //   : null,
      });

      this.logger.log(
        `User authenticated: ${user.username} (ID: ${user.id}) from Discord ${interaction.user.username}`,
      );

      // Validate game exists
      const game = await this.gameService.getGameById(options.gameId);
      
      if (!game) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF6B6B')
              .setTitle('❌ Game Not Found')
              .setDescription(`Game with ID ${options.gameId} does not exist.`)
              .setFooter({ text: 'Use /games to see available games' }),
          ],
        });
      }

      // Prepare room data
      const roomData = {
        gameId: options.gameId,
        maxSlot: options.maxPlayers ?? 4,
        minSlot: options.minPlayers ?? 1,
        typePlay: options.typePlay ?? 'casual',
        roomType: options.roomType ?? 'public',
        roomCode: options.roomCode,
        scheduledAt: options.scheduledAt,
      };

      // Validate min/max slots
      if (roomData.minSlot > roomData.maxSlot) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF6B6B')
              .setTitle('❌ Invalid Player Count')
              .setDescription('Minimum players cannot be greater than maximum players.')
              .addFields(
                { name: 'Min Players', value: roomData.minSlot.toString(), inline: true },
                { name: 'Max Players', value: roomData.maxSlot.toString(), inline: true },
              ),
          ],
        });
      }

      // Create room
      const room = await this.roomService.createRoom(user.id, roomData);

      // Create embed with room details
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🎮 Room Created Successfully!')
        .setDescription(`**${game.title}** room is now open for players!`)
        .addFields(
          { name: '🆔 Room ID', value: `#${room.id}`, inline: true },
          { name: '👥 Players', value: `1/${roomData.maxSlot}`, inline: true },
          { name: '🎯 Min Players', value: roomData.minSlot.toString(), inline: true },
          { name: '🎲 Type', value: roomData.typePlay.toUpperCase(), inline: true },
          { name: '🔓 Visibility', value: roomData.roomType.toUpperCase(), inline: true },
          { name: '📊 Status', value: room.status?.toUpperCase() || 'OPEN', inline: true },
        )
        // .setThumbnail(game.imageUrl || null)
        .setFooter({ text: `Created by ${interaction.user.username}` })
        .setTimestamp();

      // Add optional fields
      if (roomData.roomCode && room.roomType !== 'private') {
        embed.addFields({ name: '🔑 Room Code', value: `\`${roomData.roomCode}\`` });
      }

      if (roomData.scheduledAt) {
        const scheduledDate = new Date(roomData.scheduledAt);
        embed.addFields({
          name: '📅 Scheduled At',
          value: `<t:${Math.floor(scheduledDate.getTime() / 1000)}:F>`,
        });
      }

      // Create "Join Room" button
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`join_room_${room.id}`)
          .setLabel('Join Room')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🎮'),
        new ButtonBuilder()
          .setCustomId(`room_info_${room.id}`)
          .setLabel('Room Info')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('ℹ️'),
      );

      await interaction.editReply({
        embeds: [embed],
        components: [row],
      });

      this.logger.log(
        `Room ${room.id} created by Discord user ${interaction.user.username} (${interaction.user.id})`,
      );
    } catch (error) {
      this.logger.error('Error creating room:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('❌ Error Creating Room')
            .setDescription(errorMessage)
            .setFooter({ text: 'Please try again or contact support' }),
        ],
      });
    }
  }

  @Button('join_room_:roomId')
  async onJoinRoom(@Context() [interaction]: ButtonContext) {
    try {
      // Extract room ID from custom ID
      const roomId = parseInt(interaction.customId.split('_')[2]);

      await interaction.deferReply({ ephemeral: true });

      // Authenticate or create user from Discord
      const user = await this.userService.findOrCreateByDiscord({
        discordId: interaction.user.id,
        username: interaction.user.username,
        discriminator: interaction.user.discriminator || '0',
        // avatar: interaction.user.avatar
        //   ? `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`
        //   : null,
      });

      // Join room
      const result = await this.roomService.joinRoom(user.id, roomId);

      // Get room details
      const room = await this.roomService.getRoomById(roomId);

      if (!room) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF6B6B')
              .setTitle('❌ Room Not Found')
              .setDescription(`Room #${roomId} no longer exists.`),
          ],
        });
      }

      // Count current players
      const currentPlayers = room.roomRequests?.filter(
        (req) => req.status === 'approved' || req.isHost
      ).length || 1;

      // Create success embed
      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ Join Request Sent!')
        .setDescription(
          room.roomType === 'public'
            ? `You have successfully joined room #${roomId}!`
            : `Your join request for room #${roomId} has been sent to the host.`
        )
        .addFields(
          { name: '🎮 Game', value: room.game?.title || 'Unknown', inline: true },
          { name: '👥 Players', value: `${currentPlayers}/${room.maxSlot}`, inline: true },
          { name: '📊 Status', value: result.status.toUpperCase(), inline: true },
        )
        .setTimestamp();

      if (room.roomCode) {
        embed.addFields({ name: '🔑 Room Code', value: `\`${room.roomCode}\`` });
      }

      await interaction.editReply({ embeds: [embed] });

      // Update the original message to show updated player count
      if (room.roomType === 'public' && interaction.message) {
        const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
        
        // Update player count field
        const fields = originalEmbed.data.fields || [];
        const playerFieldIndex = fields.findIndex(f => f.name === '👥 Players');
        
        if (playerFieldIndex !== -1) {
          fields[playerFieldIndex].value = `${currentPlayers}/${room.maxSlot}`;
          originalEmbed.setFields(fields);
        }

        // Disable button if room is full
        if (currentPlayers >= room.maxSlot) {
          // Create new disabled button row
          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId(`join_room_${roomId}`)
              .setLabel('Room Full')
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('🎮')
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId(`room_info_${roomId}`)
              .setLabel('Room Info')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('ℹ️'),
          );
          
          await interaction.message.edit({
            embeds: [originalEmbed],
            components: [row],
          });
        } else {
          await interaction.message.edit({ embeds: [originalEmbed] });
        }
      }

      this.logger.log(
        `User ${interaction.user.username} joined room ${roomId}`,
      );
    } catch (error) {
      this.logger.error('Error joining room:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('❌ Error Joining Room')
            .setDescription(errorMessage)
            .setFooter({ text: 'Please try again or contact support' }),
        ],
      });
    }
  }

  @Button('room_info_:roomId')
  async onRoomInfo(@Context() [interaction]: ButtonContext) {
    try {
      // Extract room ID from custom ID
      const roomId = parseInt(interaction.customId.split('_')[2]);

      await interaction.deferReply({ ephemeral: true });

      // Get room details
      const room = await this.roomService.getRoomById(roomId);
      
      if (!room) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF6B6B')
              .setTitle('❌ Room Not Found')
              .setDescription(`Room #${roomId} no longer exists.`),
          ],
        });
      }

      // Count current players
      const approvedPlayers = room.roomRequests?.filter(
        (req) => req.status === 'approved' || req.isHost
      ) || [];
      
      const pendingPlayers = room.roomRequests?.filter(
        (req) => req.status === 'pending'
      ) || [];

      // Create detailed info embed
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`🎮 Room #${room.id} - Details`)
        .setDescription(`**${room.game?.title || 'Unknown Game'}**`)
        .addFields(
          { name: '👑 Host', value: room.user?.username || 'Unknown', inline: true },
          { name: '👥 Players', value: `${approvedPlayers.length}/${room.maxSlot}`, inline: true },
          { name: '🎯 Min Players', value: room.minSlot.toString(), inline: true },
          { name: '🎲 Type', value: room.typePlay?.toUpperCase() || 'CASUAL', inline: true },
          { name: '🔓 Visibility', value: room.roomType?.toUpperCase() || 'PUBLIC', inline: true },
          { name: '📊 Status', value: room.status?.toUpperCase() || 'OPEN', inline: true },
        )
        // .setThumbnail(room.game?.imageUrl || null)
        .setTimestamp(room.createdAt);

      // Add room code if exists
      if (room.roomCode) {
        embed.addFields({ name: '🔑 Room Code', value: `\`${room.roomCode}\`` });
      }

      // Add scheduled time if exists
      if (room.scheduledAt) {
        const scheduledDate = new Date(room.scheduledAt);
        embed.addFields({
          name: '📅 Scheduled At',
          value: `<t:${Math.floor(scheduledDate.getTime() / 1000)}:F>`,
        });
      }

      // Add player lists
      if (approvedPlayers.length > 0) {
        const playerList = approvedPlayers
          .map((req) => `• ${req.user?.username || 'Unknown'} ${req.isHost ? '👑' : ''}`)
          .join('\n');
        embed.addFields({ name: '✅ Current Players', value: playerList || 'None' });
      }

      if (pendingPlayers.length > 0 && room.roomType === 'private') {
        embed.addFields({
          name: '⏳ Pending Requests',
          value: pendingPlayers.length.toString(),
          inline: true,
        });
      }

      embed.setFooter({ text: `Room created at` });

      await interaction.editReply({ embeds: [embed] });

      this.logger.log(
        `User ${interaction.user.username} viewed info for room ${roomId}`,
      );
    } catch (error) {
      this.logger.error('Error getting room info:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('❌ Error Getting Room Info')
            .setDescription(errorMessage),
        ],
      });
    }
  }
}
