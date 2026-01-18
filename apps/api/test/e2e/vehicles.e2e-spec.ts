import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';

describe('VehiclesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdVehicleId: string | undefined;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    if (createdVehicleId) {
      await prisma.vehicle
        .delete({
          where: { id: createdVehicleId },
        })
        .catch(() => {
          // Vehicle já foi deletado no teste
        });
    }
    await app.close();
  });

  describe('POST /vehicles', () => {
    it('should create a new vehicle', () => {
      return request(app.getHttpServer())
        .post('/vehicles')
        .send({
          plate: 'ABC1D23',
          model: 'Test Vehicle Model',
          brand: 'Test Brand',
          year: 2023,
          color: 'Blue',
          mileage: 15000,
          renavam: '12345678901',
          chassi: 'ABC123XYZ456789',
          status: 'DISPONIVEL',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.plate).toBe('ABC1D23');
          expect(response.body.mileage).toBe(15000);
          createdVehicleId = response.body.id;
        });
    });
  });

  describe('GET /vehicles', () => {
    it('should return paginated vehicles', () => {
      return request(app.getHttpServer())
        .get('/vehicles')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('data');
          expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
  });

  describe('GET /vehicles/:id', () => {
    it('should return a specific vehicle', () => {
      return request(app.getHttpServer())
        .get(`/vehicles/${createdVehicleId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(createdVehicleId);
        });
    });
  });

  describe('PATCH /vehicles/:id', () => {
    it('should update a vehicle', () => {
      return request(app.getHttpServer())
        .patch(`/vehicles/${createdVehicleId}`)
        .send({
          mileage: 20000,
          status: 'LOCADO',
        })
        .expect(200);
    });
  });

  describe('DELETE /vehicles/:id', () => {
    it('should delete a vehicle', () => {
      return request(app.getHttpServer())
        .delete(`/vehicles/${createdVehicleId}`)
        .expect(204)
        .then(() => {
          createdVehicleId = undefined;
        });
    });
  });
});
