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

    @Column('text')
    noteOrder!: string;

    @ManyToOne(() => Client, user => user.topics, {
        onDelete: 'CASCADE'
    })
    client!: string;

    @ManyToOne(() => Subject, subject => subject.topics, {
        onDelete: 'CASCADE'
    })
    subject!: number;

    @OneToMany(() => Note, note => note.topic, {
        cascade: ['remove']
    })
    notes!: Note[];

}