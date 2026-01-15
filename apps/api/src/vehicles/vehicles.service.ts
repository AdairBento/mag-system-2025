import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleStatus } from './entities/vehicle.entity';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto) {
    try {
      return await this.prisma.vehicle.create({
        data: createVehicleDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Placa, RENAVAM ou Chassi já cadastrados');
      }
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: VehicleStatus,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { placa: { contains: search, mode: 'insensitive' } },
        { marca: { contains: search, mode: 'insensitive' } },
        { modelo: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException(`Veículo #${id} não encontrado`);
    }

    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    await this.findOne(id);

    try {
      return await this.prisma.vehicle.update({
        where: { id },
        data: updateVehicleDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Placa, RENAVAM ou Chassi já cadastrados');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.prisma.vehicle.delete({
      where: { id },
    });
  }
}
