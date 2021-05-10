import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Topic } from './Topic';
import { Client } from './Client';

@Entity()
export class Note {

    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column('text')
    text!: string;

    @Column('numeric', {
        nullable: true
    })
    previous!: number | null;

    @ManyToOne(() => Client, user => user.notes, {
        onDelete: 'CASCADE'
    })
    client!: string;

    @ManyToOne(() => Topic, topic => topic.notes, {
        onDelete: 'CASCADE'
    })
    topic!: number;

}