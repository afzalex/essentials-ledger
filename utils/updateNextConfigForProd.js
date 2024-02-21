const fs = require('fs');
const NEXTJS_CONFIG_FILE = '../next.config.mjs'

// Reading arguments from the command line
const args = process.argv.slice(2);
const [essentialsContext] = args;

if (!essentialsContext) {
    console.log('Please provide context path.');
} else {
    fs.readFile(NEXTJS_CONFIG_FILE, { encoding: 'utf8' }, (error, rawData) => {
        if (error) {
            console.error(`Error reading "${NEXTJS_CONFIG_FILE} "file:`, error);
            return;
        }

        try {
            const configData = JSON.parse(rawData);

            configData.basePath = essentialsContext;
            configData.assetPrefix = essentialsContext;
            
            const jsonString = JSON.stringify(configData, null, 2);

            // Write JSON string to a file
            fs.writeFile(NEXTJS_CONFIG_FILE, jsonString, 'utf8', function(err) {
                if (err) {
                    console.error('An error occurred:', err);
                    return;
                }
                console.log(`Updated "${NEXTJS_CONFIG_FILE}"`);
            });
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
        }
    });
}
