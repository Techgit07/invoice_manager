import config from 'config';
import mongoose from 'mongoose';
import express from 'express'
const mongooseConnection = express()
const dbUrl: any = config.get('db_url');
// console.log(dbUrl); 
// mongodb+srv://kaushalnena071:<password>@cluster0.6rtmfml.mongodb.net/?retryWrites=true&w=majority

mongoose.connect(
    dbUrl
).then(() => console.log('Database successfully connected')).catch(err => console.log(err));

export { mongooseConnection }