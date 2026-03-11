
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const templeSchema = new mongoose.Schema({}, { strict: false });
const Temple = mongoose.model('Temple', templeSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const temple = await Temple.findOne({});
        console.log('TEMPLE_DATA_START');
        console.log(JSON.stringify(temple, null, 2));
        console.log('TEMPLE_DATA_END');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();
