export class CreateTransacaoDto {
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: Date;
  categoria: string;
  metodo: string;
  referencia?: string;
  observacoes?: string;
}
