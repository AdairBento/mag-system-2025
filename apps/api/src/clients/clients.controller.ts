import { Controller, Get, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.clientsService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
      type,
      status,
    });
  }
}
