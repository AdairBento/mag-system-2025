import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { DriverStatus } from '@prisma/client';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.driversService.findAll({
      // page: Number(page) || 1, // Removido - usar filterDto default
      // limit removido - use perPage
      status: status as DriverStatus | undefined,
      clientId,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.driversService.create(data);
  }

  @Patch(':id')
  async update(@Body() updateDriverDto: any) {
    return this.driversService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.driversService.remove(id);
  }

  @Post(':id/migrate')
  async migrate(
    @Body() updateDriverDto: { newClientId: string },
  ) {
    throw new BadRequestException('Método migrate não implementado ainda');
  }
}
