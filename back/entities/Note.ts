import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Topic } from './Topic';
import { Client } from './Client';
import { Subject } from './Subject';

@Entity()
export class Note {

    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column('text')
    text!: string;

    @ManyToOne(() => Client, user => user.notes, {
        onDelete: 'CASCADE'
    })
    client!: string;

    @ManyToOne(() => Subject, subject => subject.notes, {
        onDelete: 'CASCADE'
    })
    subject!: number;

    @ManyToOne(() => Topic, topic => topic.notes, {
        onDelete: 'CASCADE'
    })
    topic!: number;

}