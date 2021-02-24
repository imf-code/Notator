import 'reflect-metadata';
import { Connection, createConnection, getConnection } from 'typeorm';
import { Client, Note, Topic, Subject, SessionStorage } from './entities/Entities';

export interface SSL {
    /** CA certificate */
    ca: string,
    /** Public key */
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

    /** Find user
     * @param user Username by default or ID if second param is true
     * @param id Whether to look for ID instead
     */
    public async findOne(user: string | undefined, id: boolean = false): Promise<Client | undefined> {
        if (!user) return undefined;

        const connection = getConnection();

        if (id) return await connection.manager.findOne(Client, {
            where: [{
                id: user
            }]
        });

        else return await connection.manager.findOne(Client, {
            where: [{
                name: user
            }]
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
     * @param userName User name, will be converted to lowercase for comparisons
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
     * Return all subjects, topics and notes for given user
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
}