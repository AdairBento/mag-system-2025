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
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { FilterClientDto } from './dto/filter-client.dto';
import { Client } from './entities/client.entity';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({
    status: 201,
    description: 'Client created successfully',
    type: Client,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Client already exists' })
  create(@Body() createClientDto: CreateClientDto) {
    // TODO: Get userId from authentication context
    @CurrentUser() currentUser: CurrentUserData; // Replace with actual user ID from JWT/session
    return this.clientsService.create(createClientDto, userId);
  }

  // ===== ADICIONAR ESTE MÉTODO AQUI =====
  @Get('search')
  @ApiOperation({ summary: 'Search clients by name, CPF or email' })
  @ApiQuery({ name: 'q', description: 'Search query', required: true })
  @ApiResponse({
    status: 200,
    description: 'List of matching clients',
    type: [Client],
  })
  async search(@Query('q') query: string) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    return this.clientsService.search(query);
  }
  // ===== FIM DA ADIÇÃO =====

  @Get()
  @ApiOperation({ summary: 'Get all clients with filters' })
  @ApiResponse({
    status: 200,
    description: 'List of clients with pagination',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: ['PF', 'PJ'] })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ATIVO', 'INATIVO', 'BLOQUEADO'],
  })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  findAll(@Query() filterDto: FilterClientDto) {
    return this.clientsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a client by ID' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({
    status: 200,
    description: 'Client found',
    type: Client,
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({
    status: 200,
    description: 'Client updated successfully',
    type: Client,
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 409, description: 'Conflict with existing data' })
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    // TODO: Get userId from authentication context
    @CurrentUser() currentUser: CurrentUserData; // Replace with actual user ID from JWT/session
    return this.clientsService.update(id, updateClientDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a client' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({
    status: 200,
    description: 'Client soft deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete client with active rentals',
  })
  remove(@Param('id') id: string) {
    // TODO: Get userId from authentication context
    @CurrentUser() currentUser: CurrentUserData; // Replace with actual user ID from JWT/session
    return this.clientsService.remove(id, userId);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a soft deleted client' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({
    status: 200,
    description: 'Client restored successfully',
    type: Client,
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 400, description: 'Client is not deleted' })
  @ApiResponse({
    status: 409,
    description: 'Cannot restore due to unique constraint',
  })
  restore(@Param('id') id: string) {
    // TODO: Get userId from authentication context
    @CurrentUser() currentUser: CurrentUserData; // Replace with actual user ID from JWT/session
    return this.clientsService.restore(id, userId);
  }

  @Delete(':id/force')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Permanently delete a client (ADMIN ONLY)',
    description: 'This action cannot be undone. Use with extreme caution.',
  })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({
    status: 200,
    description: 'Client permanently deleted',
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete due to foreign key constraints',
  })
@Roles('ADMIN')
    forceDelete(@Param('id') id: string) {
    // TODO: Add admin role check
    return this.clientsService.forceDelete(id);
  }
}
