import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FilterVehicleDto } from './dto/filter-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';

@ApiTags('Veículos')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar novo veículo' })
  @ApiResponse({
    status: 201,
    description: 'Veículo criado com sucesso',
    type: Vehicle,
  })
  @ApiResponse({
    status: 409,
    description: 'Placa/RENAVAM/Chassi já cadastrado',
  })
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os veículos com filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de veículos',
    type: [Vehicle],
  })
  findAll(@Query() filters: FilterVehicleDto) {
    return this.vehiclesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar veículo por ID' })
  @ApiResponse({
    status: 200,
    description: 'Veículo encontrado',
    type: Vehicle,
  })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar veículo' })
  @ApiResponse({
    status: 200,
    description: 'Veículo atualizado',
    type: Vehicle,
  })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Placa/RENAVAM/Chassi já cadastrado',
  })
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir veículo' })
  @ApiResponse({ status: 204, description: 'Veículo excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Veículo possui locações vinculadas',
  })
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}
