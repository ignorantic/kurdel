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
            process.exit(1);
        }
    }
}
//# sourceMappingURL=file-loader.js.map