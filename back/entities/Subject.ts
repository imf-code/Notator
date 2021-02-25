import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from './Note';
import { Client } from './Client';
import { Topic } from './Topic';

@Entity()
export class Subject {

    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column('varchar')
    name!: string;

    @ManyToOne(() => Client, user => user.subjects, {
        onDelete: 'CASCADE'
    })
    client!: string;

    @OneToMany(() => Topic, topic => topic.subject, {
        cascade: ['remove']
    })
    topics!: Topic[];

    @OneToMany(() => Note, note => note.subject, {
        cascade: ['remove']
    })
    notes!: Note[];

}