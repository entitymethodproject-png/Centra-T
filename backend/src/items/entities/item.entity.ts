import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type ItemModulo = 'tasks' | 'shopping' | 'cleaning';
export type ItemPriority = 'alta' | 'media' | 'baja';

@Entity('items')
@Index(['userId', 'modulo'])
@Index(['userId', 'fechaProgramada'])
export class ItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 120 })
  userId: string;

  @Column({ type: 'varchar', length: 20, default: 'tasks' })
  modulo: ItemModulo;

  @Column({ type: 'varchar', length: 120 })
  titulo: string;

  @Column({ type: 'text', nullable: true, default: '' })
  descripcion: string;

  @Column({ type: 'varchar', length: 10, default: 'media' })
  prioridad: ItemPriority;

  @Column({ type: 'boolean', default: false })
  completado: boolean;

  @Column({ type: 'boolean', default: false })
  comprado: boolean;

  @Column({ type: 'date', nullable: true })
  fechaProgramada: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
