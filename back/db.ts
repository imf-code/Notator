import 'reflect-metadata';
import { Connection, createConnection, getConnection } from 'typeorm';
import { Client, Note, Topic, Subject, SessionStorage } from './entities/Entities';
import bcrypt from 'bcrypt';

export interface SSL {
    /** CA certificate */
    ca: string,
    /** Private key */
    key: string,
    /** Public certificate */
    cert: string
}

export default class Database {

    /**
     * Establish connection to DB
     * @param ssl Object including necessary SSL certificates
     */
    public async connect(ssl: SSL): Promise<Connection | null> {
        return await createConnection({
            type: 'postgres',
            host: process.env.PGHOST,
            port: Number(process.env.PGPORT),
            username: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            database: process.env.PGDATABASE,
            entities: [
                Client,
                Subject,
                Topic,
                Note,
                SessionStorage
            ],
            ssl: ssl,
            connectTimeoutMS: 10000,
            synchronize: true,
            logging: false
        }).then((connection) => {
            console.log('DB connection established.');
            return connection;
        }).catch((err) => {
            console.log(err);
            return null;
        });
    }

    /** Find user by ID
     * @param userId User ID
     */
    public async findUserById(userId: string): Promise<Client | undefined> {
        if (!userId) return undefined;

        return await getConnection()
            .getRepository(Client)
            .findOne({
                where: [{
                    id: userId
                }]
            });
    }

    /** Find user by username
     * @param userName Username, will be converted to lowercase for comparisons
     */
    public async findUserByName(userName: string): Promise<Client | undefined> {
        if (!userName) return undefined;

        return await getConnection()
            .getRepository(Client)
            .findOne({
                where: [{
                    name: userName.toLowerCase()
                }]
            });
    }

    /**
     * Return all subjects, topics and notes for given user **DEPRECATED**
     * @param userId User ID
     */
    public async findDataById(userId: string): Promise<Client | undefined> {
        if (!userId) return undefined;

        return await getConnection()
            .getRepository(Client)
            .findOne({
                where: {
                    id: userId
                },
                relations: [
                    'subjects',
                    'subjects.topics',
                    'subjects.topics.notes'
                ]
            });

    }

    /**
     * Create new user
     * @param username Username
     * @param pwd Password
     */
    public async createUser(username: string, pwd: string): Promise<boolean> {
        if (await this.findUserByName(username)) {
            return false;
        };

        try {
            const connection = getConnection();

            const salt = await bcrypt.genSalt(11);
            const pwdHash = await bcrypt.hash(pwd, salt);

            const newUser = connection.manager.create(Client, {
                name: username,
                hash: pwdHash
            });

            await connection.manager.save(newUser);

            return true;
        }
        catch (err) {
            console.log(err);
            return false;
        };
    };

    /**
     * Find all subjects for a user by ID.
     * @param userId User ID
     */
    public async findSubjects(userId: string) {

        return await getConnection()
            .getRepository(Client)
            .findOne({
                where: {
                    id: userId
                },
                relations: [
                    'subjects'
                ]
            });
    }

    /**
     * Create new subject
     * @param userId User ID
     * @param subj Name of the new subject
     */
    public async createSubject(userId: string, subj: string) {

        return await getConnection()
            .createQueryBuilder()
            .insert()
            .into(Subject)
            .values([{
                client: userId,
                name: subj
            }])
            .execute();
    }

    /**
     * Rename a subject
     * @param userId User ID
     * @param subId Subject ID
     * @param subName New name for the subject
     */
    public async renameSubject(userId: string, subId: number, subName: string) {
        return await getConnection()
            .createQueryBuilder()
            .update(Subject)
            .set({
                name: subName
            })
            .where({
                client: userId,
                id: subId
            })
            .execute();
    }

    /**
     * Delete subject by ID
     * @param userId User ID
     * @param subId Subject ID
     */
    public async delSubject(userId: string, subId: number) {

        return await getConnection()
            .createQueryBuilder()
            .delete()
            .from(Subject)
            .where({
                client: userId,
                id: subId
            })
            .execute();
    }

    /**
     * Find all topics belonging to an user under given subject.
     * @param userId User ID
     * @param subId Subject ID
     */
    public async findTopics(userId: string, subId: number) {

        return await getConnection()
            .getRepository(Subject)
            .findOne({
                where: {
                    client: userId,
                    id: subId
                },
                relations: [
                    'topics'
                ]
            });
    }

    /**
     * Create new topic
     * @param userId User ID
     * @param subId Subject ID
     * @param topic Name of the new topic 
     */
    public async createTopic(userId: string, subId: number, topic: string) {

        return await getConnection()
            .createQueryBuilder()
            .insert()
            .into(Topic)
            .values([{
                client: userId,
                subject: subId,
                name: topic
            }])
            .execute();
    }

    /**
     * Rename a topic
     * @param userId User ID
     * @param topicId Topic ID
     * @param topicName New name for the topic
     */
    public async renameTopic(userId: string, topicId: number, topicName: string) {
        return await getConnection()
            .createQueryBuilder()
            .update(Topic)
            .set({
                name: topicName
            })
            .where({
                client: userId,
                id: topicId
            })
            .execute();
    }

    /**
     * Delete topic by ID
     * @param userId User ID
     * @param topicId Topic ID
     */
    public async delTopic(userId: string, topicId: number) {

        return await getConnection()
            .createQueryBuilder()
            .delete()
            .from(Topic)
            .where({
                client: userId,
                id: topicId
            })
            .execute();
    }

    /**
     * Create new note
     * @param userId User ID
     * @param subId Subject ID
     * @param topicId Topic ID
     * @param note Note text
     */
    public async createNote(userId: string, subId: number, topicId: number, note: string) {

        return await getConnection()
            .createQueryBuilder()
            .insert()
            .into(Note)
            .values([{
                client: userId,
                subject: subId,
                topic: topicId,
                text: note
            }])
            .execute();
    }

    /**
     * Update the note text.
     * @param userId User ID
     * @param noteId Note ID
     * @param newNote New text for the note.
     */
    public async updateNote(userId: string, noteId: number, newNote: string) {

        return await getConnection()
            .createQueryBuilder()
            .update(Note)
            .set({
                text: newNote
            })
            .where({
                client: userId,
                id: noteId
            })
            .execute();
    }

    /**
     * Move note from one topic to another
     * @param userId User ID
     * @param topicId Topic ID
     * @param noteId Note ID
     */
    public async moveNote(userId: string, topicId: number, noteId: number) {
        const ownsTargetTopic = await getConnection()
            .getRepository(Topic)
            .findOne({
                client: userId,
                id: topicId
            });

        if (ownsTargetTopic) {
            return await getConnection()
                .createQueryBuilder()
                .update(Note)
                .set({
                    topic: topicId
                })
                .where({
                    client: userId,
                    id: noteId
                })
                .execute();
        }
    }

    /**
     * Delete note by ID
     * @param userId User ID
     * @param noteId Note ID
     */
    public async delNote(userId: string, noteId: number) {

        return await getConnection()
            .createQueryBuilder()
            .delete()
            .from(Note)
            .where({
                client: userId,
                id: noteId
            })
            .execute();
    }
}