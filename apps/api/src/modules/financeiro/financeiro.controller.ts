import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { UpdateTransacaoDto } from './dto/update-transacao.dto';

@Controller('api/financeiro')
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTransacaoDto: CreateTransacaoDto) {
    return this.financeiroService.create(createTransacaoDto);
  }

  @Get()
  findAll() {
    return this.financeiroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.financeiroService.findOne(id);
  }

  @Get('tipo/:tipo')
  findByTipo(@Param('tipo') tipo: 'receita' | 'despesa') {
    return this.financeiroService.findByTipo(tipo);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: 'pendente' | 'pago' | 'recebido') {
    return this.financeiroService.findByStatus(status);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransacaoDto: UpdateTransacaoDto) {
    return this.financeiroService.update(id, updateTransacaoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.financeiroService.remove(id);
  }
}
