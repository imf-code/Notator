import 'reflect-metadata';
import { Connection, createConnection, getConnection } from 'typeorm';
import { Client, Note, Topic, Subject, SessionStorage } from './entities/Entities';

export interface SSL {
    ca: string,
    key: string,
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
}