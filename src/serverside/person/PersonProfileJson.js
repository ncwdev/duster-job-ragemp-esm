import { IPersonProfile } from './IPersonProfile.js';

import fs from 'fs';
import path from 'path';

// Implements person's persistence with json files.
// File name = person id.
// Just to show how it can be done. Do not use in production.
export class PersonProfileJson extends IPersonProfile {
    personId = '';

    expa = null;
    dusterJobPoints = null;

    constructor(personId) {
        super();
        this.personId = personId;
    }

    getFilePath() {
        const filePath = path.join(__dirname, 'persons', `${this.personId}.json`);

        // Ensure the directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        return filePath;
    }

    getJsonString() {
        return JSON.stringify({ expa: this.expa, dusterJobPoints: this.dusterJobPoints });
    }

    getDusterJobPoints() {
        if (this.dusterJobPoints) {
            return this.dusterJobPoints;
        }
        const filePath = this.getFilePath();
        if (fs.existsSync(filePath)) {
            const jsonString = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(jsonString);

            this.dusterJobPoints = data.dusterJobPoints;
            return this.dusterJobPoints;
        } else {
            this.setDusterJobPoints(0);
            return 0;
        }
    }

    setDusterJobPoints(value) {
        this.dusterJobPoints = value;

        const filePath = this.getFilePath();
        fs.writeFileSync(filePath, this.getJsonString(), 'utf8');
    }

    getExpa() {
        if (this.expa) {
            return this.expa;
        }
        const filePath = this.getFilePath();
        if (fs.existsSync(filePath)) {
            const jsonString = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(jsonString);

            this.expa = data.expa;
            return this.expa;
        } else {
            this.setExpa(0);
            return 0;
        }
    }

    setExpa(value) {
        this.expa = value;

        const filePath = this.getFilePath();
        fs.writeFileSync(filePath, this.getJsonString(), 'utf8');
    }
};
