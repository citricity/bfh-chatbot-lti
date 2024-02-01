const writeFileSync = require('fs').writeFileSync;
const crypto = require('crypto')

// The `generateKeyPairSync` method accepts two arguments:
// 1. The type ok keys we want, which in this case is 'rsa'
// 2. An object with the properties of the key
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    // The standard secure default length for RSA keys is 2048 bits
    modulusLength: 2048,
});

writeFileSync(`${__dirname}/rs256.rsa`, privateKey.export({ format: "pem", type: "pkcs1"}));
writeFileSync(`${__dirname}/rs256.rsa.pub`, publicKey.export({ format: "pem", type: "pkcs1"}));
