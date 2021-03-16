import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { ISession } from 'connect-typeorm';

@Entity()
export class SessionStorage implements ISession {
    @Index()
    @Column('bigint')
    public expiredAt: number = Date.now();

    @PrimaryColumn('varchar', { length: 255 })
    public id: string = '';

    @Column('text')
    public json: string = '';
    
}