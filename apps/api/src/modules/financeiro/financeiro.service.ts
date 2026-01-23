import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FinanceiroService {
  constructor(private readonly prisma: PrismaService) {}

  async getTransacoes() {
    return this.prisma.transacao.findMany({
      orderBy: { data: 'desc' },
    });
  }

  async getTransacaoById(id: string) {
    const transacao = await this.prisma.transacao.findUnique({
      where: { id },
    });

    if (!transacao) {
      throw new Error('Transação não encontrada');
    }

    return transacao;
  }

  async createTransacao(data: any) {
    return this.prisma.transacao.create({
      data,
    });
  }

  async updateTransacao(id: string, data: any) {
    return this.prisma.transacao.update({
      where: { id },
      data,
    });
  }

  async deleteTransacao(id: string) {
    return this.prisma.transacao.delete({
      where: { id },
    });
  }

  async getResumoFinanceiro() {
    const transacoes = await this.prisma.transacao.findMany();

    const receitas = transacoes
      .filter((t) => t.tipo === 'RECEITA')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const despesas = transacoes
      .filter((t) => t.tipo === 'DESPESA')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
    };
  }
}
