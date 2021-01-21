import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Topic } from './Topic';
import { Client } from './Client';

@Entity()
export class Note {

    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column('text')
    text!: string;
    
    @ManyToOne(() => Client, user => user.notes)
    client!: string;

    @ManyToOne(() => Topic, topic => topic.notes)
    topic!: number;

}