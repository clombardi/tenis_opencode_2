import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tournamentCategory.findMany({
      orderBy: { tier: 'asc' },
    });
  }

  async seed() {
    const categories = [
      { name: 'Grand Slam', code: 'GS', pointsWinner: 2000, pointsFinalist: 1000, tier: 1 },
      { name: 'Masters 1000', code: 'M1000', pointsWinner: 1000, pointsFinalist: 600, tier: 2 },
      { name: 'ATP 500', code: 'ATP500', pointsWinner: 500, pointsFinalist: 300, tier: 3 },
      { name: 'ATP 250', code: 'ATP250', pointsWinner: 250, pointsFinalist: 150, tier: 4 },
      { name: 'Challenger', code: 'CH', pointsWinner: 100, pointsFinalist: 50, tier: 5 },
    ];

    const created = [];
    for (const cat of categories) {
      const category = await this.prisma.tournamentCategory.upsert({
        where: { code: cat.code },
        update: cat,
        create: cat,
      });
      created.push(category);
    }
    return created;
  }
}