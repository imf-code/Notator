import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Topic } from './Topic';
import { Client } from './Client';
import { Subject } from './Subject';

@Entity()
export class Note {

    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column('text')
    text!: string;
    
    @ManyToOne(() => Client, user => user.notes)
    client!: string;

    @ManyToOne(() => Subject, subject => subject.notes)
    subject!: number;

    @ManyToOne(() => Topic, topic => topic.notes)
    topic!: number;

}