const jwt = require('jsonwebtoken');
const fs = require('fs');

// Require Provider
const lti = require('ltijs').Provider

const devMode = !!process.env.DEV_MODE;
const url = process.env.URL;
if (!url) {
    throw new Error('Environment must specify url for lti base (URL)');
}
const port = process.env.PORT ?? 80;
const db = process.env.DB;
if (!db) {
    throw new Error('Environment must specify db name (DB)');
}
const dbUsr = process.env.DB_USR;
if (!dbUsr) {
    throw new Error('Environment must specify db user (DB_USR)');
}
const dbPwd = process.env.DB_PWD;
if (!dbPwd) {
    throw new Error('Environment must specify db password (DB_PWD)');
}
const dbHost = process.env.DB_HOST;
if (!dbHost) {
    throw new Error('Environment must specify db host (DB_HOST)');
}
const cookieKey = process.env.COOKIE_KEY;
if (!cookieKey) {
    throw new Error('Environment must specify cookie key for singing cookies (cookieKey)');
}

let parentDomain = process.env.PARENT_DOMAIN;
if (!parentDomain?.length) {
    throw new Error('Environment must specify the parent domain (PARENT_DOMAIN) of this sub domain- e.g .citri.city');
}
if (parentDomain.substring(0, 1) !== '.') {
    // Ensure parent domain starts with a full stop (period).
    parentDomain = `.${parentDomain}`;
}
const chatbotUrl = process.env.CHATBOT_URL;
if (!chatbotUrl) {
    throw new Error('Environment must specify chatbot url (CHATBOT_URL)');
}
if (chatbotUrl.indexOf(parentDomain) === -1) {
    throw new Error('Chatbot (CHATBOT_URL) URL must be a sub domain of the parent domain');
}

// NOTE - it is recommended to proxy this via nginx as opposed to configuring
// it to run securely itself.
const sslCert = process.env?.SSL_CERT;
const sslKey = process.env?.SSL_KEY;

const options = { // Options
    appRoute: '/',
    loginRoute: '/login',
    dynRegRoute: process.env.REGISTER_ROUTE ?? '/register',
    keysetRoute: '/keyset', // Optionally, specify some of the reserved routes
    cookies: {
        secure: true, // Set secure to true if the testing platform is in a different domain and https is being used
        sameSite: 'None' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    dynReg: {
        url: `${url}`,
        name: 'Chatbot LTI tool',
        autoActivate: true
    },
    devMode // Set DevMode to false if running in a production environment with https
};

if (sslCert && sslKey) {
    options.https = true;
    options.ssl = {
        cert: fs.readFileSync(sslCert),
        key: fs.readFileSync(sslKey)
    }
}

// Main set up.
lti.setup(cookieKey, // Key used to sign cookies and tokens
    { // Database configuration
        url: `mongodb://${dbHost}/${db}`,
        connection: { user: dbUsr, pass: dbPwd }
    },
    options
)

// Set lti launch callback
lti.onConnect((token, req, res) => {
    // Create a JWT
    const key = fs.readFileSync('rs256.rsa');
    const jwtToken = jwt.sign({ ...token }, key, { algorithm: 'RS256' });

    res.cookie('token', jwtToken, {
        maxAge: 60 * 1000, // Has one minute for redirect to succeed.
        domain: parentDomain,
        sameSite: 'none',
        secure: true,
        httpOnly: true
    });

    return res.redirect(`${chatbotUrl}`);
});

const setup = async () => {
    console.log(`mongo details - db ${db} - connection ${JSON.stringify({ user: dbUsr, pass: dbPwd })} `);

    // Deploy server and open connection to the database
    await lti.deploy({ port})
}

setup();
