import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo veículo' })
  @ApiResponse({ status: 201, description: 'Veículo criado', type: Vehicle })
  @ApiResponse({ status: 409, description: 'Placa/RENAVAM/Chassi duplicados' })
  create(@Body(ValidationPipe) createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os veículos' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: VehicleStatus })
  @ApiResponse({ status: 200, description: 'Lista de veículos' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: VehicleStatus,
  ) {
    return this.vehiclesService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar veículo por ID' })
  @ApiResponse({ status: 200, description: 'Veículo encontrado', type: Vehicle })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar veículo' })
  @ApiResponse({ status: 200, description: 'Veículo atualizado', type: Vehicle })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  @ApiResponse({ status: 409, description: 'Placa/RENAVAM/Chassi duplicados' })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir veículo' })
  @ApiResponse({ status: 200, description: 'Veículo excluído' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}
