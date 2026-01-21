import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { FilterRentalDto } from './dto/filter-rental.dto';

@ApiTags('rentals')
@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova locação' })
  @ApiResponse({ status: 201, description: 'Locação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({
    status: 404,
    description: 'Cliente, motorista ou veículo não encontrado',
  })
  create(@Body() createRentalDto: CreateRentalDto) {
    return this.rentalsService.create(createRentalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as locações com paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'clientId', required: false, type: String })
  @ApiQuery({ name: 'driverId', required: false, type: String })
  @ApiQuery({ name: 'vehicleId', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ATIVA', 'CONCLUIDA', 'CANCELADA'],
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Lista de locações retornada com sucesso',
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query() filters: FilterRentalDto,
  ) {
    return this.rentalsService.findAll(page, limit, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar locação por ID' })
  @ApiResponse({ status: 200, description: 'Locação encontrada' })
  @ApiResponse({ status: 404, description: 'Locação não encontrada' })
  findOne(@Param('id') id: string) {
    return this.rentalsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar locação' })
  @ApiResponse({ status: 200, description: 'Locação atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Locação não encontrada' })
  update(@Param('id') id: string, @Body() updateRentalDto: UpdateRentalDto) {
    return this.rentalsService.update(id, updateRentalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover locação (soft delete)' })
  @ApiResponse({ status: 200, description: 'Locação removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Locação não encontrada' })
  remove(@Param('id') id: string) {
    return this.rentalsService.remove(id);
  }

  @Post(':id/return')
  @ApiOperation({ summary: 'Devolver veículo de locação' })
  @ApiResponse({ status: 200, description: 'Veículo devolvido com sucesso' })
  @ApiResponse({ status: 400, description: 'Locação não pode ser devolvida' })
  @ApiResponse({ status: 404, description: 'Locação não encontrada' })
  returnVehicle(
    @Param('id') id: string,
    @Body() body: { finalKm: number; observations?: string },
  ) {
    return this.rentalsService.returnVehicle(
      id,
      body.finalKm,
      body.observations,
    );
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar locação' })
  @ApiResponse({ status: 200, description: 'Locação cancelada com sucesso' })
  @ApiResponse({ status: 400, description: 'Locação não pode ser cancelada' })
  @ApiResponse({ status: 404, description: 'Locação não encontrada' })
  cancelRental(@Param('id') id: string) {
    return this.rentalsService.cancelRental(id);
  }
}
