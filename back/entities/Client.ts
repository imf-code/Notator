import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from './Note';
import { Topic } from './Topic';
import { Subject } from './Subject';

@Entity()
export class Client {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('varchar')
    name!: string;

    @Column('varchar')
    hash!: string;

    @OneToMany(() => Subject, subject => subject.client, {
        cascade: ['remove']
    })
    subjects!: Subject[];

    @OneToMany(() => Topic, topic => topic.client, {
        cascade: ['remove']
    })
    topics!: Topic[];

    @OneToMany(() => Note, note => note.client, {
        cascade: ['remove']
    })
    notes!: Note[];

}