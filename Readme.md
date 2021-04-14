# About Notator

# Setup
Note: The app is still in development and thus this setup guide relates only to setting up a development environment.

## SSL
The app uses HTTPS to communicate between front, back and the database. To enable it in a development environment the following files must be present in the project folders:

``` javascript
// in ./back
myCA.crt        // Root certificate
localhost.crt   // Certificate
localhost.key   // Private key

// in ./front
localhost.crt   // Certificate
localhost.key   // Private key

// Same key/certificate can be used for both front and back 
// but the files must be present in both folders
```

SSL must also be enabled for the Postgres database (more on this below).

## Front
All front end setup is done inside the `./front/` folder.

1. Run `npm install`
2. Create a `.env` file with the following:
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
2. Creata a `.env` file with the following:
    ``` javascript
    // in ./back/.env
    PGHOST=          // Postgres server URL
    PGPORT=          // Postgres port
    PGUSER=          // Postgres username
    PGPASSWORD=      // Postgres password
    PGDATABASE=      // Postgres database name

    SESSION_SECRET=  // Random string used for signing sessions
    ```
3. To run the back end use `npm start` or run the `./back/server.ts` with nodemon


## Database
The project requires a Postgres database.
Simply running the backend server will initialize the database with correct schema.

## Postgres
To setup SSL on a postgres server. server.crt, server.key, root.crt, root.crl