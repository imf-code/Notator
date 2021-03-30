# Setup

## SSL
The app uses HTTPS for communications between the front and the back as well as for any database access. To enable it in a development environment the following files must be present:

``` javascript
// in ./back
myCA.crt        // Root certificate
localhost.crt   // Certificate
localhost.key   // Private key

// in ./front
localhost.crt   // Certificate
localhost.key   // Private key
```

## .env

``` javascript
// ./front/.env
HTTPS=true
SSL_CRT_FILE=localhost.crt
SSL_KEY_FILE=localhost.key
```

``` javascript
// ./back/.env
PGHOST          // Postgres server address
PGPORT          // Postgres port
PGUSER          // Postgres username
PGPASSWORD      // Postgres password
PGDATABASE      // Postgres database name

SESSION_SECRET  // Secret string used for signing sessions
```

## Postgres
To setup SSL on a postgres server. server.crt, server.key, root.crt, root.crl