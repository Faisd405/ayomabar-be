import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

interface FindOrCreateByDiscordInput {
  discordId: string;
  username: string;
  discriminator: string;
  email?: string;
  avatar?: string;
}

@Injectable()
export class FindOrCreateUserByDiscordUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: FindOrCreateByDiscordInput) {
    // Check if user exists with this Discord ID in UserSocialite
    const existingSocialite = await this.prisma.userSocialite.findUnique({
      where: {
        socialite_name_socialite_id: {
          socialite_name: 'discord',
          socialite_id: input.discordId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true,
            bio: true,
            location: true,
            playstyle: true,
            roles: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // If user exists, return the user
    if (existingSocialite) {
      return existingSocialite.user;
    }

    // User doesn't exist, create new user with Discord info
    const generatedUsername = this.generateUsername(
      input.username,
      input.discriminator,
    );
    const generatedEmail = input.email || this.generateEmail(input.discordId);

    // Create user and socialite in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          name: input.username,
          email: generatedEmail,
          username: generatedUsername,
          avatar: input.avatar,
          roles: ['user'],
        },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          avatar: true,
          bio: true,
          location: true,
          playstyle: true,
          roles: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Create socialite link
      await tx.userSocialite.create({
        data: {
          user_id: newUser.id,
          socialite_name: 'discord',
          socialite_id: input.discordId,
        },
      });

      return newUser;
    });

    return result;
  }

  /**
   * Generate a unique username from Discord username and discriminator
   */
  private generateUsername(username: string, discriminator: string): string {
    // Remove spaces and special characters, convert to lowercase
    const cleanUsername = username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);

    // If discriminator is not "0" (new Discord username system), append it
    if (discriminator && discriminator !== '0') {
      return `${cleanUsername}_${discriminator}`;
    }

    // For new Discord usernames (no discriminator), add a random suffix
    const randomSuffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `${cleanUsername}_${randomSuffix}`;
  }

  /**
   * Generate email from Discord ID if not provided
   */
  private generateEmail(discordId: string): string {
    return `discord_${discordId}@ayomabar.local`;
  }
}
