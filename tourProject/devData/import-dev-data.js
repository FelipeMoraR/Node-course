import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import Tour from '../models/tourModel.js';

dotenv.config({ path: '../.env' })
const DB = process.env.CONNECTION;

mongoose.connect(DB, {
    useNewUrlParser: true
}).then(() => {
    console.log('DB connection success!');
})

const tour = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'));

const importData = async () => {
    try {
        await Tour.create(tour);
        console.log('Tours created!');
    } catch (err) {
        console.log('importData::: ', err);
    }

    // NOTE aggresive way to end it but in this case is not a problem
    process.exit();
}

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Tours deleted');
    } catch (err) {
        console.log('deleteData::: ', err);
    }

    // NOTE aggresive way to end it but in this case is not a problem
    process.exit();
}

if (process.argv.find(el => el === '--import')) {
    importData(); 
} 
else if (process.argv.find(el => el === '--delete')) {
    deleteData();
}

