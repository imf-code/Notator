import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { Test } from './entities/Teste';

require('dotenv').config();

createConnection({
    type: 'postgres',
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    entities: [
        Test
    ],
    synchronize: true,
    logging: false

}).then(connection => {
    let testi = new Test;
    testi.test = 'fooBar';

    connection.manager.save(testi)
        .then(t => console.log(`Done! ID = ${t.id}. Message: ${t.test}`))
        .catch(err => console.log(err));

}).catch(err => console.log(err));