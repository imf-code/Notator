import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from './Note';
import { Topic } from './Topic';

@Entity()
export class Client {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('varchar')
    name!: string;

    @Column('varchar')
    token!: string;

    @OneToMany(() => Note, note => note.client)
    notes!: Note[];

    @OneToMany(() => Topic, topic => topic.client)
    topics!: Topic[];

}