import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from './Note';
import { Client } from './Client';

@Entity()
export class Topic {

    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column('varchar')
    name!: string;

    @OneToMany(() => Note, note => note.topic)
    notes!: Note[]

    @ManyToOne(() => Client, user => user.topics)
    client!: string;

}