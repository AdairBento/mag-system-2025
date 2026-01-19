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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { FilterDriverDto } from './dto/filter-driver.dto';
import { DriverEntity } from './entities/driver.entity';

@ApiTags('drivers')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new driver' })
  @ApiResponse({
    status: 201,
    description: 'Driver successfully created',
    type: DriverEntity,
  })
  @ApiResponse({
    status: 409,
    description: 'Driver with this license number already exists',
  })
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drivers with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of drivers',
    type: [DriverEntity],
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by driver name',
  })
  @ApiQuery({
    name: 'cpf',
    required: false,
    description: 'Filter by CPF',
  })
  @ApiQuery({
    name: 'licenseNumber',
    required: false,
    description: 'Filter by license number',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    description: 'Filter by client ID',
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    description: 'Include soft deleted drivers',
    type: Boolean,
  })
  findAll(@Query() filters: FilterDriverDto) {
    return this.driversService.findAll(filters);
  }

    @Post(':id/migrate')
  async migrate(
    @Param('id') id: string,
    @Body() migrateDto: { newClientId: string | null },
  ) {
    return this.driversService.migrate(id, migrateDto.newClientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a driver by ID' })
  @ApiParam({
    name: 'id',
    description: 'Driver UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    description: 'Include if driver is soft deleted',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Driver found',
    type: DriverEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Driver not found',
  })
  findOne(
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted?: boolean,
  ) {
    return this.driversService.findOne(id, includeDeleted);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a driver' })
  @ApiParam({
    name: 'id',
    description: 'Driver UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Driver successfully updated',
    type: DriverEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Driver not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Driver with this license number already exists',
  })
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(id, updateDriverDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a driver' })
  @ApiParam({
    name: 'id',
    description: 'Driver UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Driver successfully soft deleted',
    type: DriverEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Driver not found',
  })
  remove(@Param('id') id: string) {
    return this.driversService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft deleted driver' })
  @ApiParam({
    name: 'id',
    description: 'Driver UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Driver successfully restored',
    type: DriverEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Driver not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Driver is not deleted or license conflict',
  })
  restore(@Param('id') id: string) {
    return this.driversService.restore(id);
  }

  @Delete(':id/force')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete a driver' })
  @ApiParam({
    name: 'id',
    description: 'Driver UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Driver permanently deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Driver not found',
  })
  forceDelete(@Param('id') id: string) {
    return this.driversService.forceDelete(id);
  }

  
}