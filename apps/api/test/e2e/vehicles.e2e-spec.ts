import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest'; // ✅ SEM "* as"
import { AppModule } from '../../src/app.module';

describe('VehiclesController (e2e)', () => {
  let app: INestApplication;
  let createdVehicleId: string | undefined;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ✅ Limpar antes de cada teste
  beforeEach(async () => {
    // Se o veículo foi criado no teste anterior, deletar
    if (createdVehicleId) {
      await request(app.getHttpServer())
        .delete(`/vehicles/${createdVehicleId}`)
        .catch(() => {}); // Ignorar erro se não existir
      createdVehicleId = undefined;
    }
  });

  describe('POST /vehicles', () => {
    it('should create a new vehicle', () => {
      const uniquePlate = `TST${Date.now().toString().slice(-4)}`;

      return request(app.getHttpServer())
        .post('/vehicles')
        .send({
          plate: uniquePlate,
          brand: 'Volkswagen',
          model: 'Gol',
          year: 2020,
          color: 'Preto',
          mileage: 35000,
          dailyRate: 90,
          weeklyRate: 500,
          monthlyRate: 1600,
          status: 'DISPONIVEL',
        })
        .expect(201)
        .then((response) => {
          createdVehicleId = response.body.id;
          expect(response.body).toHaveProperty('id');
          expect(response.body.plate).toBe(uniquePlate);
          expect(response.body.brand).toBe('Volkswagen');
          expect(response.body.model).toBe('Gol');
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
    it('should return a specific vehicle', async () => {
      const uniquePlate = `TST${Date.now().toString().slice(-4)}`;

      const createResponse = await request(app.getHttpServer())
        .post('/vehicles')
        .send({
          plate: uniquePlate,
          brand: 'Ford',
          model: 'Ka',
          year: 2021,
          color: 'Branco',
          mileage: 20000,
          dailyRate: 80,
          weeklyRate: 450,
          monthlyRate: 1400,
          status: 'DISPONIVEL',
        })
        .expect(201);

      createdVehicleId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/vehicles/${createdVehicleId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(createdVehicleId);
          expect(response.body.plate).toBe(uniquePlate);
        });
    });
  });

  describe('PATCH /vehicles/:id', () => {
    it('should update a vehicle', async () => {
      const uniquePlate = `TST${Date.now().toString().slice(-4)}`;

      const createResponse = await request(app.getHttpServer())
        .post('/vehicles')
        .send({
          plate: uniquePlate,
          brand: 'Chevrolet',
          model: 'Onix',
          year: 2022,
          color: 'Vermelho',
          mileage: 15000,
          dailyRate: 100,
          weeklyRate: 550,
          monthlyRate: 1800,
          status: 'DISPONIVEL',
        })
        .expect(201);

      createdVehicleId = createResponse.body.id;

      return request(app.getHttpServer())
        .patch(`/vehicles/${createdVehicleId}`)
        .send({
          mileage: 16000,
          status: 'ALUGADO',
        })
        .expect(200)
        .then((response) => {
          expect(response.body.mileage).toBe(16000);
          expect(response.body.status).toBe('ALUGADO');
        });
    });
  });

  describe('DELETE /vehicles/:id', () => {
    it('should delete a vehicle', async () => {
      const uniquePlate = `TST${Date.now().toString().slice(-4)}`;

      const createResponse = await request(app.getHttpServer())
        .post('/vehicles')
        .send({
          plate: uniquePlate,
          brand: 'Fiat',
          model: 'Uno',
          year: 2019,
          color: 'Azul',
          mileage: 40000,
          dailyRate: 70,
          weeklyRate: 400,
          monthlyRate: 1300,
          status: 'DISPONIVEL',
        })
        .expect(201);

      const vehicleId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/vehicles/${vehicleId}`)
        .expect(204);

      return request(app.getHttpServer())
        .get(`/vehicles/${vehicleId}`)
        .expect(404);
    });
  });
});
