import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('transacoes')
export class Transacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', enum: ['receita', 'despesa'] })
  tipo: 'receita' | 'despesa';

  @Column()
  descricao: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor: number;

  @Column()
  data: Date;

  @Column()
  categoria: string;

  @Column()
  metodo: string;

  @Column({
    type: 'varchar',
    enum: ['pendente', 'pago', 'recebido'],
    default: 'pendente',
  })
  status: 'pendente' | 'pago' | 'recebido';

  @Column({ nullable: true })
  referencia: string;

  @Column({ nullable: true, type: 'text' })
  observacoes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
