import 'reflect-metadata';
import { Connection, createConnection } from 'typeorm';
import { Client, Note, Topic, Subject } from './entities/Entities';

export async function dbConnect(ssl: { ca: string, key: string, cert: string }): Promise<Connection | null> {
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
            Note
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