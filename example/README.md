# Basic NodeJS Example

Link the HEAD code of keycloak-connect by running:

```
npm link ../
```

Install the dependencies and start NodeJS example by running:

```
npm install
KEYCLOAK_CLIENT_ID=<your_client_id> KEYCLOAK_CLIENT_SECRET=<your_client_secret> KEYCLOAK_IDP_HINT=<your_idp_id> npm start
```

Open the browser at http://localhost:3000/ and login.
