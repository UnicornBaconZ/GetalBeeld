import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRandomNumber(max: number): number {
    const upper = Math.min(Math.max(Math.trunc(max) || 0, 0), 20);
    return Math.floor(Math.random() * (upper + 1));
  }
}
