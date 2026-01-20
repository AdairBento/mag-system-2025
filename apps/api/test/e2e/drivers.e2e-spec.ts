import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';

describe('DriversController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdDriverId: string | undefined;
  let testClientId: string | undefined;

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

    const client = await prisma.client.create({
      data: {
        type: 'PF',
        name: 'Test Client for Driver',
        cpf: '98765432100',
        cellphone: '31987654321',
        email: 'driverclient@example.com',
        zipCode: '30130100',
        street: 'Rua Driver Test',
        number: '456',
        neighborhood: 'Centro',
        city: 'Belo Horizonte',
        state: 'MG',
      },
    });
    testClientId = client.id;
  });

  afterAll(async () => {
    if (createdDriverId) {
      await prisma.driver
        .delete({
          where: { id: createdDriverId },
        })
        .catch(() => {
          // Driver já foi deletado no teste
        });
    }
    if (testClientId) {
      await prisma.client
        .delete({
          where: { id: testClientId },
        })
        .catch(() => {
          // Client já foi deletado
        });
    }
    await app.close();
  });

  describe('POST /drivers', () => {
    it('should create a new driver', () => {
      return request(app.getHttpServer())
        .post('/drivers')
        .send({
          name: 'Test Driver E2E',
          cpf: '11122233344',
          rg: 'MG1234567',
          birthDate: '1990-01-01',
          email: 'testdriver@example.com',
          cellphone: '31988887777',
          licenseNumber: '12345678900',
          licenseCategory: 'B',
          licenseExpiry: '2028-12-31',
          status: 'ATIVO',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.name).toBe('Test Driver E2E');
          expect(response.body.cpf).toBe('11122233344');
          createdDriverId = response.body.id;
        });
    });
  });

  describe('GET /drivers', () => {
    it('should return paginated drivers', () => {
      return request(app.getHttpServer())
        .get('/drivers')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('items');
          expect(Array.isArray(response.body.items)).toBe(true);
          expect(response.body).toHaveProperty('total');
        });
    });
  });

  describe('GET /drivers/:id', () => {
    it('should return a specific driver', () => {
      return request(app.getHttpServer())
        .get(`/drivers/${createdDriverId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(createdDriverId);
        });
    });
  });

  describe('PATCH /drivers/:id', () => {
    it('should update a driver', () => {
      return request(app.getHttpServer())
        .patch(`/drivers/${createdDriverId}`)
        .send({
          email: 'updated@example.com',
          cellphone: '31999998888',
        })
        .expect(200);
    });
  });

  describe('DELETE /drivers/:id', () => {
    it('should delete a driver', () => {
      return request(app.getHttpServer())
        .delete(`/drivers/${createdDriverId}`)
        .expect(200)
        .then(() => {
          createdDriverId = undefined;
        });
    });
  });
});
