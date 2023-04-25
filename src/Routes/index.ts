"use strict"
import express, { Request, Response } from 'express';
import { userStatus } from '../common';
import { adminRouter } from './admin';
import { authRouter } from './auth';
import { uploadRouter } from './upload';
import { userRouter } from './user';

const routes = express.Router();

const accessControl = (req: Request, res: Response, next: any) => {
    req.headers.userType = userStatus[req.originalUrl.split('/')[1]]
    next()
}

routes.use('/auth', accessControl, authRouter);
routes.use('/user', accessControl, userRouter);
routes.use('/admin', accessControl, adminRouter);
routes.use('/upload', accessControl, uploadRouter);

export { routes }
