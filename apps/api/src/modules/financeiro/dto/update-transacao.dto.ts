export class UpdateTransacaoDto {
  tipo?: 'receita' | 'despesa';
  descricao?: string;
  valor?: number;
  data?: Date;
  categoria?: string;
  metodo?: string;
  status?: 'pendente' | 'pago' | 'recebido';
  referencia?: string;
  observacoes?: string;
}
