import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaClient } from '@prisma/client';

describe('Rentals (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let clientId: string;
  let vehicleId: string;
  let driverId: string;
  let rentalId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = new PrismaClient();

    // Criar cliente para usar nos testes
    const client = await prisma.client.create({
      data: {
        type: 'PF',
        name: 'Cliente Teste Rental',
        cpf: '11122233344',
        email: 'clienterental@test.com',
        cellphone: '11999999999',
      },
    });
    clientId = client.id;

    // Criar veículo para usar nos testes
    const vehicle = await prisma.vehicle.create({
      data: {
        plate: 'XYZ9876',
        brand: 'Chevrolet',
        model: 'Onix',
        year: 2022,
        color: 'Prata',
        renavam: '98765432109',
        status: 'DISPONIVEL',
      },
    });
    vehicleId = vehicle.id;

    // Criar motorista para usar nos testes
    const driver = await prisma.driver.create({
      data: {
        clientId,
        name: 'Motorista Teste Rental',
        cpf: '55566677788',
        email: 'motoristamental@test.com',
        cellphone: '11988888888',
        licenseNumber: '99988877766',
        licenseCategory: 'B',
        licenseExpiry: new Date('2030-12-31'),
        status: 'ATIVO',
      },
    });
    driverId = driver.id;
  });

  afterAll(async () => {
    // Limpar dados de teste
    await prisma.rental.deleteMany({ where: { clientId } });
    await prisma.driver.deleteMany({ where: { id: driverId } });
    await prisma.vehicle.deleteMany({ where: { id: vehicleId } });
    await prisma.client.deleteMany({ where: { id: clientId } });
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /rentals', () => {
    it('should create a rental', () => {
      return request(app.getHttpServer())
        .post('/rentals')
        .send({
          clientId,
          vehicleId,
          driverId,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          dailyRate: 150.0,
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.clientId).toBe(clientId);
          expect(response.body.vehicleId).toBe(vehicleId);
          expect(response.body.driverId).toBe(driverId);
          rentalId = response.body.id;
        });
    });
  });

  describe('GET /rentals', () => {
    it('should return all rentals', () => {
      return request(app.getHttpServer())
        .get('/rentals')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('items');
          expect(Array.isArray(response.body.items)).toBe(true);
          expect(response.body.items.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /rentals/:id', () => {
    it('should return a rental by id', () => {
      return request(app.getHttpServer())
        .get(`/rentals/${rentalId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(rentalId);
        });
    });
  });

  describe('PATCH /rentals/:id', () => {
    it('should update a rental', () => {
      return request(app.getHttpServer())
        .patch(`/rentals/${rentalId}`)
        .send({
          dailyRate: 180.0,
        })
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(rentalId);
        });
    });
  });

  describe('POST /rentals/:id/return', () => {
    it('should return a rental', () => {
      return request(app.getHttpServer())
        .post(`/rentals/${rentalId}/return`)
        .send({
          endDate: new Date().toISOString(),
        })
        .expect(201)
        .then((response) => {
          expect(response.body.id).toBe(rentalId);
          expect(response.body.status).toBe('CONCLUIDA');
        });
    });
  });
});
