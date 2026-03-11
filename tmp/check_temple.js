
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const templeSchema = new mongoose.Schema({
    name: String,
    timeSlots: [String],
    poojaTypes: [String]
}, { strict: false });

const Temple = mongoose.model('Temple', templeSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const temples = await Temple.find({});
        console.log(JSON.stringify(temples, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();
