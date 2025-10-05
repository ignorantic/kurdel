import fs from 'fs';
export class JSONLoader {
    load(filePath) {
        try {
            const rawData = fs.readFileSync(filePath, 'utf8');
            const config = JSON.parse(rawData);
            return config;
        }
        catch (err) {
            console.error(`Error reading config file: ${err}`);
            throw new Error(`Failed to read config file: ${filePath}`);
        }
    }
}
//# sourceMappingURL=json-loader.js.map