import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    await app.init();
  });

  it('/ (GET) renders the Getalbeeld page', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        if (!res.text.includes('Getalbeeld')) {
          throw new Error('Expected page to mention Getalbeeld');
        }
      });
  });

  it('/api/random (GET) returns a value within range', () => {
    return request(app.getHttpServer())
      .get('/api/random?max=20')
      .expect(200)
      .expect((res) => {
        if (res.body.value < 0 || res.body.value > 20) {
          throw new Error('Random value out of range');
        }
      });
  });
});
