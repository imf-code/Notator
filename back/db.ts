import 'reflect-metadata';
import { Connection, createConnection, getConnection } from 'typeorm';
import { Client, Note, Topic, Subject, SessionStorage } from './entities/Entities';
import bcrypt from 'bcrypt';

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
            console.log(salt);
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
}