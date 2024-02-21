const CryptoJS = require('crypto-js');
const fs = require('fs');
const moment = require('moment')
const KEY_INFO_FILE = '../app/keyinfo.json'

function encryptMessage(message, password) {
    return CryptoJS.AES.encrypt(message, password).toString();
}

// Reading arguments from the command line
const args = process.argv.slice(2);
const [essentialsUrl, password] = args;

if (!essentialsUrl || !password) {
    console.log('Please provide a value to encrypt and a password as arguments.');
} else {
    const encryptedValue = encryptMessage(essentialsUrl, password);

    fs.readFile(KEY_INFO_FILE, { encoding: 'utf8' }, (error, rawData) => {
        if (error) {
            console.error(`Error reading "${KEY_INFO_FILE} "file:`, error);
            return;
        }

        try {
            const keyInfo = JSON.parse(rawData);
            keyInfo.url = encryptedValue;
            keyInfo.updatedTimestamp = moment().toISOString()
            
            const jsonString = JSON.stringify(keyInfo, null, 2);

            // Write JSON string to a file
            fs.writeFile(KEY_INFO_FILE, jsonString, 'utf8', function(err) {
                if (err) {
                    console.error('An error occurred:', err);
                    return;
                }
                console.log(`Updated "${KEY_INFO_FILE}" with encrypted url`);
            });
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
        }
    });
}
