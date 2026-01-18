import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Clients E2E Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('✅ should create a PF client (Adair Bento da Costa Junior)', async () => {
    const payload = {
      type: 'PF',
      status: 'ATIVO',
      name: 'Adair Bento da Costa Junior',
      cpf: '12345678900',
      cellphone: '31999887766',
      email: 'adair@test.com',
      cnhNumero: '12345678901',
      cnhCategoria: 'B',
      cnhValidade: '2025-12-31',
      cep: '30130100',
      logradouro: 'Av. Afonso Pena',
      numero: '1500',
      bairro: 'Centro',
      cidade: 'Betim',
      estado: 'MG',
    };

    const response = await request(app.getHttpServer())
      .post('/clients')
      .send(payload)
      .expect(201);

    console.log('✅ Cliente criado:', response.body);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Adair Bento da Costa Junior');
  });

  it('✅ should list clients', async () => {
    const response = await request(app.getHttpServer())
      .get('/clients?page=1&limit=10')
      .expect(200);

    console.log('📋 Total de clientes:', response.body.total);
    expect(response.body).toHaveProperty('items');
    expect(response.body).toHaveProperty('total');
  });
});
