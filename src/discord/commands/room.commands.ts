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
  Message,
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

  /**
   * Calculate expiration time for a room (default: 5 Minutes)
   */
  private getDefaultExpirationTime(): Date {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes from now
    return expiresAt;
  }

  /**
   * Check if room is expired based on expiresAt timestamp
   */
  private checkRoomExpiration(room: any): {
    isExpired: boolean;
    timeUntilExpiration?: number;
  } {
    // If room is closed or completed, it's expired
    if (room.status === 'closed' || room.status === 'completed') {
      return {
        isExpired: true,
      };
    }

    // Check if room has an expiration date
    if (!room.expiresAt) {
      return {
        isExpired: false,
      };
    }

    const now = new Date();
    const expiresAt = new Date(room.expiresAt);
    const timeUntilExpiration = expiresAt.getTime() - now.getTime();

    // Room has expired
    if (timeUntilExpiration <= 0) {
      return {
        isExpired: true,
        timeUntilExpiration: 0,
      };
    }

    // Room is still active
    return {
      isExpired: false,
      timeUntilExpiration,
    };
  }

  /**
   * Format time until expiration for display
   */
  private formatTimeUntilExpiration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Create buttons based on room expiration status
   */
  private createRoomButtonsWithExpiration(
    roomId: number,
    isFull: boolean,
    expirationInfo: { isExpired: boolean },
  ) {
    const isExpired = expirationInfo.isExpired;

    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`join_room_${roomId}`)
        .setLabel(
          isExpired
            ? 'Expired - Cannot Join'
            : isFull
              ? 'Room Full'
              : 'Join Room'
        )
        .setStyle(
          isExpired
            ? ButtonStyle.Danger
            : isFull
              ? ButtonStyle.Secondary
              : ButtonStyle.Success
        )
        .setEmoji(isExpired ? '🔒' : '🎮')
        .setDisabled(isFull || isExpired),
      new ButtonBuilder()
        .setCustomId(`room_info_${roomId}`)
        .setLabel('Room Info')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('ℹ️'),
      new ButtonBuilder()
        .setCustomId(`bump_room_${roomId}`)
        .setLabel('Bump')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⬆️')
        .setDisabled(isExpired),
    );
  }

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
      const expiresAt = this.getDefaultExpirationTime();
      const roomData = {
        gameId: options.gameId,
        maxSlot: options.maxPlayers ?? 4,
        minSlot: options.minPlayers ?? 1,
        typePlay: options.typePlay ?? 'casual',
        roomType: options.roomType ?? 'public',
        roomCode: options.roomCode,
        scheduledAt: options.scheduledAt,
        expiresAt: expiresAt.toISOString(),
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

      if (roomData.scheduledAt) {
        const scheduledDate = new Date(roomData.scheduledAt);
        embed.addFields({
          name: '📅 Scheduled At',
          value: `<t:${Math.floor(scheduledDate.getTime() / 1000)}:F>`,
        });
      }

      // Add expiration time
      if (room.expiresAt) {
        const expirationTimestamp = Math.floor(new Date(room.expiresAt).getTime() / 1000);
        embed.addFields({
          name: '⏰ Expires At',
          value: `<t:${expirationTimestamp}:R> (<t:${expirationTimestamp}:F>)`,
        });
      }

      // Create buttons with expiration status
      const expirationInfo = this.checkRoomExpiration(room);
      const row = this.createRoomButtonsWithExpiration(room.id, false, expirationInfo);

      const message = await interaction.editReply({
        embeds: [embed],
        components: [row],
      });

      // Store message ID and channel ID for future bump operations
      await this.roomService.updateRoom(user.id, room.id, {
        discordMessageId: (message as Message).id,
        discordChannelId: interaction.channelId,
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

      // Get room details first to check existing requests
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

      // Check if user is the host
      if (room.userId === user.id) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FEE75C')
              .setTitle('⚠️ You are the Host')
              .setDescription('You cannot join your own room as you are already the host!'),
          ],
        });
      }

      // Check room expiration status
      const expirationInfo = this.checkRoomExpiration(room);

      if (expirationInfo.isExpired) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#ED4245')
              .setTitle('🔒 Room Expired')
              .setDescription('This room lobby has expired and cannot accept new players.')
              .addFields(
                { name: '🎮 Game', value: room.game?.title || 'Unknown', inline: true },
                { name: '📊 Status', value: 'EXPIRED', inline: true },
              )
              .setTimestamp(),
          ],
        });
      }

      // Check if user already has a request (pending, accepted, or rejected)
      const existingRequest = room.roomRequests?.find(
        (req) => req.userId === user.id
      );

      if (existingRequest) {
        const statusMessages = {
          pending: {
            color: '#FEE75C',
            title: '⏳ Request Already Pending',
            description: `You already have a pending request for this room.\nPlease wait for the host to approve it.`,
          },
          accepted: {
            color: '#57F287',
            title: '✅ Already in Room',
            description: `You have already joined this room!`,
          },
          rejected: {
            color: '#ED4245',
            title: '❌ Request Rejected',
            description: `Your previous request was rejected by the host.\nYou cannot request to join this room again.`,
          },
        };

        const statusInfo = statusMessages[existingRequest.status] || {
          color: '#99AAB5',
          title: '❓ Unknown Status',
          description: `You have an existing request with status: ${existingRequest.status}`,
        };

        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(statusInfo.color)
              .setTitle(statusInfo.title)
              .setDescription(statusInfo.description)
              .addFields(
                { name: '🎮 Game', value: room.game?.title || 'Unknown', inline: true },
                { name: '📊 Request Status', value: existingRequest.status.toUpperCase(), inline: true },
              )
              .setTimestamp(existingRequest.createdAt),
          ],
        });
      }

      // Check if room is full
      const currentPlayers = room.roomRequests?.filter(
        (req) => req.status === 'accepted' || req.isHost
      ).length || 1;

      if (currentPlayers >= room.maxSlot) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#ED4245')
              .setTitle('🚫 Room Full')
              .setDescription(`This room is already full (${currentPlayers}/${room.maxSlot} players).`)
              .addFields(
                { name: '🎮 Game', value: room.game?.title || 'Unknown', inline: true },
                { name: '👥 Players', value: `${currentPlayers}/${room.maxSlot}`, inline: true },
              ),
          ],
        });
      }

      // Join room
      const result = await this.roomService.joinRoom(user.id, roomId);

      // Recalculate current players after join
      const updatedCurrentPlayers = currentPlayers + 1;

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
          { name: '👥 Players', value: `${updatedCurrentPlayers}/${room.maxSlot}`, inline: true },
          { name: '📊 Status', value: result.status.toUpperCase(), inline: true },
        )
        .setTimestamp();

      if (room.roomCode) {
        embed.addFields({ name: '🔑 Room Code', value: `\`${room.roomCode}\`` });
      }

      await interaction.editReply({ embeds: [embed] });

      // Update the original room lobby message for all viewers
      // Update public lobby message
      if (room.roomType === 'public') {
        try {
          let channel = interaction.channel;

          if (!channel && interaction.message?.channelId) {
            const fetchedChannel = await interaction.client.channels.fetch(interaction.message.channelId);
            channel = fetchedChannel?.isTextBased() ? fetchedChannel : null;
          }

          if (!channel || !('messages' in channel)) {
            this.logger.warn(`⚠️ No message channel available for room ${roomId}, skipping UI update`);
            return;
          }

          const originalMessage = await channel.messages.fetch(interaction.message.id);

          const embed = EmbedBuilder.from(originalMessage.embeds[0]);
          const fields = embed.data.fields ?? [];

          const index = fields.findIndex(f => f.name === '👥 Players');
          if (index !== -1) {
            fields[index].value = `${updatedCurrentPlayers}/${room.maxSlot}`;
            embed.setFields(fields);
          }

          const isFull = updatedCurrentPlayers >= room.maxSlot;
          const expirationInfo = this.checkRoomExpiration(room);
          
          const row = this.createRoomButtonsWithExpiration(roomId, isFull, expirationInfo);

          await originalMessage.edit({
            embeds: [embed],
            components: [row],
          });

          this.logger.log(`✅ Lobby updated for room ${roomId}`);
        } catch (err) {
          this.logger.error(`❌ Failed updating lobby for room ${roomId}`, err);
        }
      } else {
        this.logger.debug(
          `Skipping lobby update - roomType: ${room.roomType}, hasMessage: ${!!interaction.message}, hasChannel: ${!!interaction.channel}`,
        );
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
      const acceptedPlayers = room.roomRequests?.filter(
        (req) => req.status === 'accepted' || req.isHost
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
          { name: '👥 Players', value: `${acceptedPlayers.length}/${room.maxSlot}`, inline: true },
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

      // Add expiration info
      const expirationInfo = this.checkRoomExpiration(room);
      if (room.expiresAt) {
        const expirationTimestamp = Math.floor(new Date(room.expiresAt).getTime() / 1000);
        const statusEmoji = expirationInfo.isExpired ? '🔒' : '⏰';
        
        let statusText: string;
        if (expirationInfo.isExpired) {
          statusText = `❌ Expired at <t:${expirationTimestamp}:F>`;
        } else {
          statusText = `Expires <t:${expirationTimestamp}:R> (<t:${expirationTimestamp}:F>)`;
        }

        embed.addFields({
          name: `${statusEmoji} Expiration Status`,
          value: statusText,
        });
      }

      // Add player lists
      if (acceptedPlayers.length > 0) {
        const playerList = acceptedPlayers
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

  @Button('bump_room_:roomId')
  async onBumpRoom(@Context() [interaction]: ButtonContext) {
    try {
      const roomId = parseInt(interaction.customId.split('_')[2]);
      await interaction.deferReply({ ephemeral: true });

      // Authenticate user
      const user = await this.userService.findOrCreateByDiscord({
        discordId: interaction.user.id,
        username: interaction.user.username,
        discriminator: interaction.user.discriminator || '0',
      });

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

      // Check if user is the host
      if (room.userId !== user.id) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FEE75C')
              .setTitle('⚠️ Permission Denied')
              .setDescription('Only the room host can bump the room!'),
          ],
        });
      }

      // Check expiration status
      const expirationInfo = this.checkRoomExpiration(room);

      // Check if room is closed or completed
      if (room.status === 'closed' || room.status === 'completed') {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#ED4245')
              .setTitle('❌ Room Closed')
              .setDescription('You cannot bump a closed or completed room.'),
          ],
        });
      }

      // Get the channel and delete old message if it exists
      if (room.discordMessageId && room.discordChannelId) {
        try {
          const channel = await interaction.client.channels.fetch(room.discordChannelId);
          
          if (channel?.isTextBased() && 'messages' in channel) {
            const oldMessage = await channel.messages.fetch(room.discordMessageId);
            await oldMessage.delete();
            this.logger.log(`🗑️ Deleted old lobby message for room ${roomId}`);
          }
        } catch (error) {
          this.logger.warn(`⚠️ Could not delete old message for room ${roomId}:`, error.message);
        }
      }

      // Get game details
      const game = await this.gameService.getGameById(room.gameId);

      // Count current players
      const currentPlayers = room.roomRequests?.filter(
        (req) => req.status === 'accepted' || req.isHost
      ).length || 1;

      // Create new embed
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🎮 Room Lobby (Bumped)')
        .setDescription(`**${game?.title || 'Unknown Game'}** room is open for players!`)
        .addFields(
          { name: '🆔 Room ID', value: `#${room.id}`, inline: true },
          { name: '👥 Players', value: `${currentPlayers}/${room.maxSlot}`, inline: true },
          { name: '🎯 Min Players', value: room.minSlot.toString(), inline: true },
          { name: '🎲 Type', value: room.typePlay?.toUpperCase() || 'CASUAL', inline: true },
          { name: '🔓 Visibility', value: room.roomType?.toUpperCase() || 'PUBLIC', inline: true },
          { name: '📊 Status', value: room.status?.toUpperCase() || 'OPEN', inline: true },
        )
        .setFooter({ text: `Created by ${room.user?.username || 'Unknown'} • Bumped by ${interaction.user.username}` })
        .setTimestamp();

      if (room.roomCode && room.roomType !== 'private') {
        embed.addFields({ name: '🔑 Room Code', value: `\`${room.roomCode}\`` });
      }

      if (room.scheduledAt) {
        const scheduledDate = new Date(room.scheduledAt);
        embed.addFields({
          name: '📅 Scheduled At',
          value: `<t:${Math.floor(scheduledDate.getTime() / 1000)}:F>`,
        });
      }

      // Add new expiration time
      const newExpiresAt = this.getDefaultExpirationTime();
      const expirationTimestamp = Math.floor(newExpiresAt.getTime() / 1000);
      embed.addFields({
        name: '⏰ Expires At',
        value: `<t:${expirationTimestamp}:R> (<t:${expirationTimestamp}:F>)`,
      });

      // Create buttons
      const isFull = currentPlayers >= room.maxSlot;
      const activeExpirationInfo = { isExpired: false };
      const row = this.createRoomButtonsWithExpiration(room.id, isFull, activeExpirationInfo);

      // Send new message in the channel
      const channel = interaction.channel;
      if (!channel?.isTextBased() || !('send' in channel)) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#ED4245')
              .setTitle('❌ Channel Error')
              .setDescription('Unable to send message in this channel.'),
          ],
        });
      }

      const newMessage = await channel.send({
        embeds: [embed],
        components: [row],
      });

      // Update room with new message ID and expiration
      const now = new Date();
      await this.roomService.updateRoom(user.id, room.id, {
        discordMessageId: newMessage.id,
        discordChannelId: newMessage.channelId,
        expiresAt: newExpiresAt.toISOString(),
        lastBumpedAt: now.toISOString(),
      });

      // Send confirmation to user
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ Room Bumped!')
            .setDescription(`Room #${roomId} has been bumped to the top of the channel.\nExpiration time has been reset.`)
            .addFields({
              name: '⏰ New Expiration',
              value: `<t:${expirationTimestamp}:R>`,
              inline: true,
            })
            .setTimestamp(),
        ],
      });

      this.logger.log(
        `⬆️ Room bumped: Room ${roomId} by ${interaction.user.username}`,
      );
    } catch (error) {
      this.logger.error('Error bumping room:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('❌ Error Bumping Room')
            .setDescription(errorMessage)
            .setFooter({ text: 'Please try again or contact support' }),
        ],
      });
    }
  }
}
