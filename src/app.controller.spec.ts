import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the view data for the index page', () => {
      const result = appController.root();
      expect(result.title).toContain('Getalbeeld');
      expect(result.description.length).toBeGreaterThan(0);
    });
  });

  describe('getRandomNumber', () => {
    it('defaults to a number between 0 and 10', () => {
      const { value } = appController.getRandomNumber();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(10);
    });

    it('respects a provided max', () => {
      const { value } = appController.getRandomNumber('20');
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(20);
    });

    it('never returns the excluded number', () => {
      for (let i = 0; i < 200; i += 1) {
        const { value } = appController.getRandomNumber('10', '4');
        expect(value).not.toBe(4);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(10);
      }
    });

    it('can still return the first and last number when excluding another', () => {
      const seen = new Set<number>();
      for (let i = 0; i < 500; i += 1) {
        seen.add(appController.getRandomNumber('10', '5').value);
      }
      expect(seen.has(0)).toBe(true);
      expect(seen.has(10)).toBe(true);
      expect(seen.has(5)).toBe(false);
    });
  });
});
