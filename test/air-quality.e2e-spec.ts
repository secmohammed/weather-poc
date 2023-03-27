import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { ValidationPipe } from '../src/shared/pipes/validation.pipe';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import config from '../src/shared/config';
import { createDatabaseIfDoesntExist, dropDatabaseIfExists } from '../src/shared/utils/database';
import { Sequelize } from 'sequelize';

describe('API endpoints testing (e2e)', () => {
  let app: INestApplication;
  let sequelizeConn: any;
  beforeAll(async () => {
    const fastify = new FastifyAdapter({
      logger: config.app.env !== 'production',
    });
    await createDatabaseIfDoesntExist();
    sequelizeConn = new Sequelize(config.database);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication(fastify);
    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
    await dropDatabaseIfExists();
  });
  it('/air-quality/coordinates/peak WITH valid Coordinates (GET)', async () => {
    // fill in the database with one result before fetching peak.
    await request(app.getHttpServer()).get('/api/air-quality/coordinates?latitude=48.856613&longitude=2.352222').send();

    const res = await request(app.getHttpServer())
      .get('/api/air-quality/coordinates/peak?latitude=48.856613&longitude=2.352222')
      .send();
    expect(res.body).toMatchObject({
      peak: expect.any(Number),
    });
    expect(res.status).toBe(200);
  });
  it('/air-quality/coordinates/peak WITH invalid Coordinates given (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/air-quality/coordinates/peak?latitude=28.856613&longitude=-1.352222')
      .send();
    expect(res.body).toMatchObject({
      message: expect.any(String),
      statusCode: 400,
    });
    expect(res.status).toBe(400);
  });
  it('/air-quality/coordinates WITH invalid Coordinates given (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/air-quality/coordinates?latitude=28.856613&longitude=-1.352222')
      .send();
    expect(res.body).toMatchObject({
      message: expect.any(String),
      statusCode: 400,
    });
    expect(res.status).toBe(400);
  });
  it('/air-quality/coordinates/peak with no coordinates given (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/api/air-quality/coordinates/peak').send();
    expect(res.status).toBe(422);
  });
  it('/air-quality/coordinates WITH valid Coordinates (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/air-quality/coordinates?latitude=48.856613&longitude=2.352222')
      .send();
    expect(res.body).toMatchObject({
      location: { type: 'Point' },
    });
    expect(res.status).toBe(200);
  });
  it('/air-quality/coordinates With no coordinates given (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/api/air-quality/coordinates').send();
    expect(res.status).toBe(422);
  });
});
