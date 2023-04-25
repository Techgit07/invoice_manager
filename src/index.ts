"use strict"
/**
 * @author Kaushal Nena
 * @description Server and REST API config
 */
import * as bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors'
import { mongooseConnection } from './database'
import * as packageInfo from '../package.json'
import config from 'config'
import { routes } from './Routes'
import { preferences_on_due_date__cron, preferences_seven_day_after_due_date__cron, preferences_three_day_after_due_date__cron, preferences_three_day_before_due_date__cron } from './helper/cron';


const app = express();
app.use(cors())
app.use(mongooseConnection)
app.use(bodyParser.json({ limit: '200mb' }))
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }))
const health = (req, res) => {
    return res.status(200).json({
        message: `Invoice Manager Backend Server is Running, Server health is green`,
        app: packageInfo.name,
        version: packageInfo.version,
        description: packageInfo.description,
        author: packageInfo.author,
        license: packageInfo.license
    })
}
const bad_gateway = (req, res) => { return res.status(502).json({ status: 502, message: "Invoice Manager Backend Backend API Bad Gateway" }) }

app.get('/', health);
app.get('/health', health);
app.get('/isServerUp', (req, res) => {
    res.send('Server is running ');
});
app.use(routes);
app.use('*', bad_gateway);

// preferences_on_due_date__cron.start()
preferences_on_due_date__cron.start()
preferences_three_day_before_due_date__cron.start()
preferences_three_day_after_due_date__cron.start()
preferences_seven_day_after_due_date__cron.start()
let server = new http.Server(app);
export default server;
