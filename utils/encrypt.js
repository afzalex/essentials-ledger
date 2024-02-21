const CryptoJS = require('crypto-js');

function encryptMessage(message, password) {
    return CryptoJS.AES.encrypt(message, password).toString();
}

// Reading arguments from the command line
const args = process.argv.slice(2);
const [valueToEncrypt, password] = args;

if (!valueToEncrypt || !password) {
    console.log('Please provide a value to encrypt and a password as arguments.');
} else {
    const encryptedValue = encryptMessage(valueToEncrypt, password);
    console.log('Encrypted Value:', encryptedValue);
}
