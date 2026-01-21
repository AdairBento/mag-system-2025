import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { FilterRentalDto } from './dto/filter-rental.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RentalsService {
  constructor(private prisma: PrismaService) {}

  async create(createRentalDto: CreateRentalDto) {
    const {
      clientId,
      driverId,
      vehicleId,
      startDate,
      endDate,
      dailyRate,
      discount,
      status,
      observations,
    } = createRentalDto;

    // Validar cliente
    const client = await this.prisma.client.findUnique({
      where: { id: clientId, deletedAt: null },
    });
    if (!client) {
      throw new NotFoundException(`Cliente com ID ${clientId} não encontrado`);
    }

    // Validar motorista
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId, deletedAt: null },
    });
    if (!driver) {
      throw new NotFoundException(
        `Motorista com ID ${driverId} não encontrado`,
      );
    }

    // Validar veículo
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId, deletedAt: null },
    });
    if (!vehicle) {
      throw new NotFoundException(`Veículo com ID ${vehicleId} não encontrado`);
    }

    // Verificar disponibilidade do veículo
    const isAvailable = await this.checkVehicleAvailability(
      vehicleId,
      new Date(startDate),
      new Date(endDate),
    );
    if (!isAvailable) {
      throw new BadRequestException(
        'Veículo não está disponível para o período solicitado',
      );
    }

    // Calcular valores
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 3600 * 24),
    );

    if (totalDays <= 0) {
      throw new BadRequestException(
        'Data de término deve ser posterior à data de início',
      );
    }

    const rate =
      dailyRate ?? (vehicle.dailyRate ? Number(vehicle.dailyRate) : 0);
    const totalValue = rate * totalDays;
    const discountValue = discount ?? 0;
    const _finalValue = totalValue - discountValue;

    return this.prisma.rental.create({
      data: {
        clientId,
        driverId,
        vehicleId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        dailyRate: rate,
        totalDays,
        totalValue,
        discount: discountValue,
        status: status ?? 'ATIVA',
        observations,
      },
      include: {
        client: true,
        driver: true,
        vehicle: true,
      },
    });
  }

  async findAll(page = 1, limit = 10, filters?: FilterRentalDto) {
    const skip = (page - 1) * limit;

    const where: Prisma.RentalWhereInput = {
      deletedAt: null,
      ...(filters?.clientId && { clientId: filters.clientId }),
      ...(filters?.driverId && { driverId: filters.driverId }),
      ...(filters?.vehicleId && { vehicleId: filters.vehicleId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.startDate && {
        startDate: { gte: new Date(filters.startDate) },
      }),
      ...(filters?.endDate && { endDate: { lte: new Date(filters.endDate) } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.rental.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: true,
          driver: true,
          vehicle: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rental.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const rental = await this.prisma.rental.findUnique({
      where: { id, deletedAt: null },
      include: {
        client: true,
        driver: true,
        vehicle: true,
      },
    });

    if (!rental) {
      throw new NotFoundException(`Locação com ID ${id} não encontrada`);
    }

    return rental;
  }

  async update(id: string, updateRentalDto: UpdateRentalDto) {
    await this.findOne(id);

    const { returnDate, ...rest } = updateRentalDto;

    return this.prisma.rental.update({
      where: { id },
      data: {
        ...rest,
        ...(returnDate && { returnDate: new Date(returnDate) }),
        ...(rest.startDate && { startDate: new Date(rest.startDate) }),
        ...(rest.endDate && { endDate: new Date(rest.endDate) }),
        updatedAt: new Date(),
      },
      include: {
        client: true,
        driver: true,
        vehicle: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.rental.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  private async checkVehicleAvailability(
    vehicleId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    const conflictingRentals = await this.prisma.rental.count({
      where: {
        vehicleId,
        deletedAt: null,
        status: 'ATIVA',
        OR: [
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } },
            ],
          },
          {
            AND: [
              { startDate: { gte: startDate } },
              { endDate: { lte: endDate } },
            ],
          },
        ],
      },
    });

    return conflictingRentals === 0;
  }

  async returnVehicle(id: string, finalKm: number, observations?: string) {
    const rental = await this.findOne(id);

    if (rental.status !== 'ATIVA') {
      throw new BadRequestException(
        'Apenas locações ativas podem ser devolvidas',
      );
    }

    // Atualizar locação
    const updatedRental = await this.prisma.rental.update({
      where: { id },
      data: {
        status: 'CONCLUIDA',
        returnDate: new Date(),
        observations: observations || rental.observations,
        isActive: false,
      },
      include: {
        client: true,
        driver: true,
        vehicle: true,
      },
    });

    // Atualizar quilometragem do veículo
    await this.prisma.vehicle.update({
      where: { id: rental.vehicleId },
      data: {
        mileage: finalKm,
        status: 'DISPONIVEL',
      },
    });

    return updatedRental;
  }

  async cancelRental(id: string) {
    const rental = await this.findOne(id);

    if (rental.status !== 'ATIVA') {
      throw new BadRequestException(
        'Apenas locações ativas podem ser canceladas',
      );
    }

    // Atualizar locação
    const updatedRental = await this.prisma.rental.update({
      where: { id },
      data: {
        status: 'CANCELADA',
        isActive: false,
      },
      include: {
        client: true,
        driver: true,
        vehicle: true,
      },
    });

    // Liberar veículo
    await this.prisma.vehicle.update({
      where: { id: rental.vehicleId },
      data: {
        status: 'DISPONIVEL',
      },
    });

    return updatedRental;
  }
}
