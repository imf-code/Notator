Notator is a post-it note application with secure signup/login and the ability to organize the notes under different topics.

# Setup
Note: The app is still in development and therefore this setup guide relates only to setting up a development environment.

## SSL
The app uses SSL encryption to communicate between front, back and database. To enable it in a development environment the following certificates must be added to the project folders:

``` javascript
// in ./back/
myCA.crt        // Root certificate
localhost.crt   // Certificate
localhost.key   // Private key

// in ./front/
localhost.crt   // Certificate
localhost.key   // Private key

// Same key and certificate can be used for both front and back 
// but the files must be present in both folders
```

SSL must also be enabled separately for the database (more on this below).

## Front
All front end setup is done inside the `./front/` folder.

1. Run `npm install`
2. Create a `.env` file with the following information:
    ``` javascript
    // in ./front/.env
    HTTPS=true
    SSL_CRT_FILE=localhost.crt
    SSL_KEY_FILE=localhost.key
    ```
3. To run the front end use `npm start`

## Back
All back end setup is done inside the `./back/` folder.

1. Run `npm install`
2. Creata a `.env` file with the following information:
    ``` javascript
    // in ./back/.env
    PGHOST=          // Postgres server URL
    PGPORT=          // Postgres port
    PGUSER=          // Postgres username
    PGPASSWORD=      // Postgres password
    PGDATABASE=      // Postgres database name

    SESSION_SECRET=  // Random string used for signing sessions
    ```
3. To run the back end use `npm start` or run `server.ts` with nodemon or equivalent

## Database
This app uses Postgres as its database. To set it up follow the guidance offered on the [official Postgres site](https://www.postgresql.org/).

### Schema
Running the back end server and successfully connecting it to the database will automatically generate all the necessary tables and relations. This may destroy some or all existing data, so using an otherwise empty database is recommended.

### SSL
To enable SSL on a Postgres server you need to:
1. Change `SSL` to `on` in `postgresql.conf` found inside your db data folder
2. Add following certificate files to your database data folder: 
    ```javascript
    // In Postgres database data folder
    server.key      // Private key
    server.crt      // Certificate

    // Same key and certificate can be used here also
    // but the files must be named as shown above
    ```
3. Restart the databse server

# Technologies
* Typescript
* Node
* React
* TailwindCSS
* Express
* Typeorm
* Postgres