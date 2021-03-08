import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Client } from './Client';
import { Topic } from './Topic';

@Entity()
export class Subject {

    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column('varchar')
    name!: string;

    @Column('text')
    topicOrder!: string;

    @ManyToOne(() => Client, user => user.subjects, {
        onDelete: 'CASCADE'
    })
    client!: string;

    @OneToMany(() => Topic, topic => topic.subject, {
        cascade: ['remove']
    })
    topics!: Topic[];

}