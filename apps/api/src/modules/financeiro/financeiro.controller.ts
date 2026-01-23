import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';

@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Post()
  async create(@Body() data: any) {
    return this.financeiroService.createTransacao(data);
  }

  @Get()
  async findAll() {
    return this.financeiroService.getTransacoes();
  }

  @Get('resumo')
  async getResumo() {
    return this.financeiroService.getResumoFinanceiro();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.financeiroService.getTransacaoById(id);
  }

  @Get('tipo/:tipo')
  async findByTipo(@Param('tipo') tipo: string) {
    const transacoes = await this.financeiroService.getTransacoes();
    return transacoes.filter((t) => t.tipo === tipo);
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    const transacoes = await this.financeiroService.getTransacoes();
    return transacoes.filter((t) => t.status === status);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.financeiroService.updateTransacao(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.financeiroService.deleteTransacao(id);
  }
}
