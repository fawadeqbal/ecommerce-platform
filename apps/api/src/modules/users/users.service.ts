import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * UsersService — customer profiles and addresses.
 * TODO: update profile, address CRUD, account deletion request, email preferences.
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        status: true,
        emailVerifiedAt: true,
        createdAt: true,
        roles: { select: { role: { select: { name: true } } } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return { ...user, roles: user.roles.map((r) => r.role.name) };
  }

  addresses(userId: string) {
    return this.prisma.address.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } });
  }
}
