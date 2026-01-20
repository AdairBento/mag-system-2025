import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';

describe('ClientsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdClientId: string | undefined;

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
    if (createdClientId) {
      await prisma.client
        .delete({
          where: { id: createdClientId },
        })
        .catch(() => {
          // Client já foi deletado no teste
        });
    }
    await app.close();
  });

  describe('POST /clients', () => {
    it('should create a new client', () => {
      return request(app.getHttpServer())
        .post('/clients')
        .send({
          type: 'PF',
          name: 'Test Client E2E',
          cpf: '12345678901',
          cellphone: '31987654321',
          email: 'testclient@example.com',
          zipCode: '30130100',
          street: 'Rua Test',
          number: '123',
          neighborhood: 'Centro',
          city: 'Belo Horizonte',
          state: 'MG',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.name).toBe('Test Client E2E');
          expect(response.body.cpf).toBe('12345678901');
          expect(response.body.zipCode).toBe('30130100');
          expect(response.body.street).toBe('Rua Test');
          createdClientId = response.body.id;
        });
    });
  });

  describe('GET /clients', () => {
    it('should return paginated clients', () => {
      return request(app.getHttpServer())
        .get('/clients')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('items');
          expect(Array.isArray(response.body.items)).toBe(true);
          expect(response.body).toHaveProperty('total');
        });
    });
  });

  describe('GET /clients/:id', () => {
    it('should return a specific client', async () => {
      return request(app.getHttpServer())
        .get(`/clients/${createdClientId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(createdClientId);
        });
    });
  });

  describe('PATCH /clients/:id', () => {
    it('should update a client', () => {
      return request(app.getHttpServer())
        .patch(`/clients/${createdClientId}`)
        .send({
          name: 'Updated Test Client',
          cellphone: '31999999999',
        })
        .expect(200);
    });
  });

  describe('DELETE /clients/:id', () => {
    it('should delete a client', () => {
      return request(app.getHttpServer())
        .delete(`/clients/${createdClientId}`)
        .expect(200)
        .then(() => {
          createdClientId = undefined;
        });
    });
  });
});
