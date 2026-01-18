import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

type ListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  clientId?: string;
};

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: ListParams) {
    const { page, limit, search, status, clientId } = params;

    // ✅ Convert to number
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { licenseNumber: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all' && status !== 'ALL') {
      where.status = status;
    }

    if (clientId && clientId !== 'all' && clientId !== 'ALL') {
      where.clientId = clientId;
    }

    const [items, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { name: 'asc' },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      }),
      this.prisma.driver.count({ where }),
    ]);

    const itemsWithClientName = items.map((item) => ({
      ...item,
      clientName: item.client?.name || null,
    }));

    return { items: itemsWithClientName, total };
  }

  async findOne(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException('Motorista não encontrado');
    }

    return driver;
  }

  async create(data: any) {
    console.log('📥 CRIANDO MOTORISTA:', {
      cpf: data.cpf,
      name: data.name,
      clientId: data.clientId,
    });

    // 1️⃣ VALIDATE CLIENT EXISTS AND IS PJ (ONLY IF clientId IS PROVIDED)
    if (data.clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: data.clientId },
      });

      if (!client) {
        throw new NotFoundException('Cliente não encontrado');
      }

      if (client.type !== 'PJ') {
        throw new BadRequestException(
          'Motorista deve estar vinculado a uma Pessoa Jurídica (PJ)',
        );
      }

      console.log('✅ Cliente encontrado:', client.type, client.name);
    }

    // 2️⃣ CHECK DUPLICATE CPF
    const cpfLimpo = data.cpf.replace(/\D/g, '');
    const existingDriver = await this.prisma.driver.findFirst({
      where: { cpf: cpfLimpo },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (existingDriver) {
      console.log('🚨 CPF JÁ CADASTRADO:', existingDriver.name);

      // If trying to link to ANOTHER company → suggest migration
      if (data.clientId && existingDriver.clientId !== data.clientId) {
        const oldClient = existingDriver.client;
        const newClient = await this.prisma.client.findUnique({
          where: { id: data.clientId },
        });

        throw new ConflictException({
          message: 'Motorista já vinculado a outro cliente. Deseja migrar?',
          driver: {
            id: existingDriver.id,
            name: existingDriver.name,
            cpf: existingDriver.cpf,
            currentClient: oldClient?.name || 'Sem vínculo',
            newClient: newClient?.name || 'Desconhecido',
          },
          requiresMigration: true,
        });
      }

      // If trying to create exactly the same
      throw new ConflictException({
        message: 'CPF já cadastrado como motorista deste cliente',
        driver: {
          id: existingDriver.id,
          name: existingDriver.name,
          cpf: existingDriver.cpf,
        },
      });
    }

    // 3️⃣ CREATE DRIVER
    const licenseExpiryDate = data.licenseExpiry
      ? new Date(data.licenseExpiry + 'T00:00:00.000Z')
      : null;

    return this.prisma.driver.create({
      data: {
        name: data.name.trim(),
        cpf: cpfLimpo,
        email: data.email?.toLowerCase().trim() || null,
        licenseNumber: data.licenseNumber?.trim() || null,
        licenseCategory: data.licenseCategory || null,
        licenseExpiry: licenseExpiryDate,
        phone: data.phone?.replace(/\D/g, '') || null,
        cellphone: data.cellphone?.replace(/\D/g, '') || null,
        clientId: data.clientId || null,
        status: data.status || 'ATIVO',
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);

    // ✅ BLOCK clientId change via update (force migration endpoint)
    if (data.clientId !== undefined) {
      const driver = await this.prisma.driver.findUnique({ where: { id } });

      if (
        driver?.clientId &&
        data.clientId &&
        driver.clientId !== data.clientId
      ) {
        throw new BadRequestException({
          message:
            'Use o endpoint de migração para mudar o cliente do motorista',
          requiresMigration: true,
        });
      }
    }

    const licenseExpiryDate = data.licenseExpiry
      ? new Date(data.licenseExpiry + 'T00:00:00.000Z')
      : undefined;

    return this.prisma.driver.update({
      where: { id },
      data: {
        name: data.name?.trim(),
        cpf: data.cpf?.replace(/\D/g, ''),
        email: data.email?.toLowerCase().trim(),
        licenseNumber: data.licenseNumber?.trim(),
        licenseCategory: data.licenseCategory,
        licenseExpiry: licenseExpiryDate,
        phone: data.phone?.replace(/\D/g, ''),
        cellphone: data.cellphone?.replace(/\D/g, ''),
        status: data.status,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.driver.delete({ where: { id } });
  }

  // 🔄 MIGRATE DRIVER TO ANOTHER CLIENT
  async migrate(id: string, newClientId: string) {
    const driver = await this.findOne(id);

    const newClient = await this.prisma.client.findUnique({
      where: { id: newClientId },
      select: { id: true, name: true, type: true },
    });

    if (!newClient) {
      throw new NotFoundException('Novo cliente não encontrado');
    }

    if (newClient.type !== 'PJ') {
      throw new BadRequestException(
        'Cliente destino precisa ser Pessoa Jurídica (PJ)',
      );
    }

    if (driver.clientId === newClientId) {
      throw new BadRequestException(
        'Motorista já está vinculado a este cliente',
      );
    }

    const oldClient = driver.client;

    const updated = await this.prisma.driver.update({
      where: { id },
      data: { clientId: newClientId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log('✅ Motorista migrado:', {
      driver: driver.name,
      from: oldClient?.name || 'Sem vínculo',
      to: newClient.name,
    });

    return updated;
  }
}
