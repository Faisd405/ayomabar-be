import { Injectable, Logger } from '@nestjs/common';
import { Context, Options, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { GameService } from 'src/core/game/game.service';
import { EmbedBuilder } from 'discord.js';
import { SkipThrottle } from '@nestjs/throttler';
import { GamesListOptionsDto, GameDetailOptionsDto } from '../dto';

@SkipThrottle()
@Injectable()
export class GameCommands {
  private readonly logger = new Logger(GameCommands.name);

  constructor(private readonly gameService: GameService) {}

  @SlashCommand({
    name: 'games',
    description: 'List all available games',
  })
  async onGamesList(
    @Context() [interaction]: SlashCommandContext,
    @Options() options: GamesListOptionsDto,
  ) {
    try {
      await interaction.deferReply();

      const pageNumber = Number(options.page ?? 1) || 1;

      // Build query object for the game service
      const query: any = {
        page: pageNumber,
        limit: 10,
        sortBy: 'title',
        sortOrder: 'asc',
      };

      // Only add filter parameters if they have actual values
      if (options.search?.trim()) {
        query.search = options.search.trim();
      }
      if (options.genre?.trim()) {
        query.genre = options.genre.trim();
      }
      if (options.platform?.trim()) {
        query.platform = options.platform.trim();
      }

      const result = await this.gameService.getGamesList(query);

      if (!result.data?.length) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF6B6B')
              .setTitle('🎮 No Games Found')
              .setDescription('No games match your search criteria.'),
          ],
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle('🎮 Available Games')
        .setDescription(
          result.data
            .map((game, index) => {
              const number = (pageNumber - 1) * 10 + index + 1;
              return `**${number}.** ${game.title}
Genre: ${game.genre ?? '-'} • Platform: ${game.platform ?? '-'} • Released: ${
                game.releaseDate
                  ? new Date(game.releaseDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '-'
              }`;
            })
            .join('\n\n'),
        )
        .setFooter({
          text: `Page ${result.meta.page} of ${result.meta.totalPages} • Total: ${result.meta.total} games`,
        })
        .setTimestamp();

      // Show active filters
      const filters: string[] = [];
      if (query.search) filters.push(`Search: "${query.search}"`);
      if (query.genre) filters.push(`Genre: "${query.genre}"`);
      if (query.platform) filters.push(`Platform: "${query.platform}"`);

      if (filters.length > 0) {
        embed.addFields({
          name: '🔍 Active Filters',
          value: filters.join(' • '),
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      this.logger.error('Error fetching games list', error);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Error')
            .setDescription('An error occurred while fetching the games list.'),
        ],
      });
    }
  }

  @SlashCommand({
    name: 'game',
    description: 'Get details about a specific game',
  })
  async onGameDetail(
    @Context() [interaction]: SlashCommandContext,
    @Options() options: GameDetailOptionsDto,
  ) {
    try {
      await interaction.deferReply();

      const game = await this.gameService.getGameById(options.id);

      if (!game) {
        const notFoundEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('❌ Game Not Found')
          .setDescription(`No game found with ID: ${options.id}`)
          .setTimestamp();

        return interaction.editReply({ embeds: [notFoundEmbed] });
      }

      const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle(`🎮 ${game.title}`)
        .setTimestamp();

      const fields: { name: string; value: string; inline: boolean }[] = [];

      if (game.genre) {
        fields.push({
          name: '🎯 Genre',
          value: game.genre,
          inline: true,
        });
      }

      if (game.platform) {
        fields.push({
          name: '💻 Platform',
          value: game.platform,
          inline: true,
        });
      }

      if (game.releaseDate) {
        const releaseDate = new Date(game.releaseDate);
        fields.push({
          name: '📅 Release Date',
          value: releaseDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          inline: true,
        });
      }

      fields.push({
        name: 'ℹ️ Game ID',
        value: `${game.id}`,
        inline: true,
      });

      fields.push({
        name: '📆 Added',
        value: new Date(game.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        inline: true,
      });

      if (fields.length > 0) {
        embed.addFields(fields);
      }

      await interaction.editReply({ embeds: [embed] });

      this.logger.log(
        `Game detail requested: ${game.title} by ${interaction.user.tag}`,
      );
    } catch (error) {
      this.logger.error('Error fetching game detail', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Error')
        .setDescription('An error occurred while fetching the game details.')
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
}
