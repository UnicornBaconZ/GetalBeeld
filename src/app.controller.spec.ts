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
  });
});
