import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from './Note';
import { Client } from './Client';
import { Subject } from './Subject';

@Entity()
export class Topic {

    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column('varchar')
    name!: string;

    @ManyToOne(() => Client, user => user.topics)
    client!: string;

    @ManyToOne(() => Subject, subject => subject.topics)
    subject!: number;

    @OneToMany(() => Note, note => note.topic)
    notes!: Note[];


}