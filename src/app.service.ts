import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRandomNumber(max: number, exclude?: number): number {
    const upper = Math.min(Math.max(Math.trunc(max) || 0, 0), 20);
    const canExclude =
      upper > 0 &&
      exclude !== undefined &&
      Number.isInteger(exclude) &&
      exclude >= 0 &&
      exclude <= upper;
    if (!canExclude) {
      return Math.floor(Math.random() * (upper + 1));
    }
    // Pick from the other `upper` numbers, skipping over the excluded one.
    const value = Math.floor(Math.random() * upper);
    return value >= exclude ? value + 1 : value;
  }
}
