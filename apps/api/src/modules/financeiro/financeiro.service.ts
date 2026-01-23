import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transacao } from './entities/transacao.entity';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { UpdateTransacaoDto } from './dto/update-transacao.dto';

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(Transacao)
    private readonly transacaoRepository: Repository<Transacao>,
  ) {}

  async create(createTransacaoDto: CreateTransacaoDto): Promise<Transacao> {
    const transacao = this.transacaoRepository.create(createTransacaoDto);
    return this.transacaoRepository.save(transacao);
  }

  async findAll(): Promise<Transacao[]> {
    return this.transacaoRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Transacao> {
    const transacao = await this.transacaoRepository.findOne({ where: { id } });
    if (!transacao) {
      throw new Error('Transação não encontrada');
    }
    return transacao;
  }

  async update(
    id: string,
    updateTransacaoDto: UpdateTransacaoDto,
  ): Promise<Transacao> {
    await this.transacaoRepository.update(id, updateTransacaoDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.transacaoRepository.delete(id);
  }

  async findByTipo(tipo: 'receita' | 'despesa'): Promise<Transacao[]> {
    return this.transacaoRepository.find({
      where: { tipo },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(
    status: 'pendente' | 'pago' | 'recebido',
  ): Promise<Transacao[]> {
    return this.transacaoRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }
}
