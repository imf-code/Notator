import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { Client, Note, Topic } from './entities/Entities';
// import * as Entities from './entities/Entities';

require('dotenv').config();

createConnection({
    type: 'postgres',
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    entities: [
        Client,
        Note,
        Topic
    ],
    synchronize: true,
    logging: false
}).then(connection => {

    let newUser = new Client;
    newUser.name = 'Testaaja';
    newUser.token = 'Foo';

    connection.manager.save(newUser)
        .then(t => console.log(`Done! ID = ${t.id}.`))
        .catch(err => console.log(err));

}).catch(err => console.log(err));