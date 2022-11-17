/*
 * Copyright 2016 Red Hat Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

const Keycloak = require('keycloak-connect');
const hogan = require('hogan-express');
const express = require('express');
const session = require('express-session');

const app = express();

const server = app.listen(3000, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});

// Register '.mustache' extension with The Mustache Express
app.set('view engine', 'html');
app.set('views', require('path').join(__dirname, '/view'));
app.engine('html', hogan);

// A normal un-protected public URL.

app.get('/', function (req, res) {
    res.render('index');
});

// Create a session-store to be used by both the express-session
// middleware and the keycloak middleware.

const memoryStore = new session.MemoryStore();

app.use(
    session({
        secret: 'mySecret',
        resave: false,
        saveUninitialized: true,
        store: memoryStore,
    })
);

// Provide the config and session store to the Keycloak so that sessions
// can be invalidated from the Keycloak console callback.
// Make sure that you set the KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET and
// KEYCLOAK_IDP_HINT environment variables.
const config = {
    realm: 'master',
    'auth-server-url':
        process.env.KEYCLOAK_AUTH_URL || 'https://login.edgeimpulse.com/auth/',
    'ssl-required': 'external',
    resource: process.env.KEYCLOAK_CLIENT_ID || 'studio-staging',
    'confidential-port': 0,
    // @ts-ignore
    credentials: {
        secret: process.env.KEYCLOAK_CLIENT_SECRET,
    },
};

const keycloak = new Keycloak(
    {
        store: memoryStore,
        idpHint: process.env.KEYCLOAK_IDP_HINT || 'okta',
    },
    config
);

// Install the Keycloak middleware.
//
// Specifies that the user-accessible application URL to
// logout should be mounted at /logout
//
// Specifies that Keycloak console callbacks should target the
// root URL.  Various permutations, such as /k_logout will ultimately
// be appended to the admin URL.

app.use(
    keycloak.middleware({
        logout: '/logout',
        admin: '/',
        protected: '/protected/resource',
    })
);

app.get('/login', keycloak.protect(), function (req, res) {
    res.render('index', {
        result: JSON.stringify(
            JSON.parse(req.session['keycloak-token']),
            null,
            4
        ),
        event: '1. Authentication\n2. Login',
    });
});

app.get('/protected/resource', keycloak.protect(), function (req, res) {
    res.render('index', {
        result: JSON.stringify(
            JSON.parse(req.session['keycloak-token']),
            null,
            4
        ),
        event: '1. Access granted to Default Resource\n',
    });
});

app.get('/studio', keycloak.protect(), function (req, res) {
    res.redirect(
        `http://edgeimpulse.optra.com:4800/sso-login?idp=${process.env.KEYCLOAK_IDP_HINT}`
    );
});
