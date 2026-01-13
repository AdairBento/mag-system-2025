import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.driversService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
      status,
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
  async update(@Param('id') id: string, @Body() data: any) {
    return this.driversService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.driversService.remove(id);
  }

  @Post(':id/migrate')
  async migrate(
    @Param('id') id: string,
    @Body() data: { newClientId: string },
  ) {
    return this.driversService.migrate(id, data.newClientId);
  }
}
