"use strict"
import express from 'express'
import { uploadPdf, uploadS3, userJWT } from '../helper'
import * as validation from '../validation'

const routes = express.Router()

routes.post('/image/:file', userJWT, uploadS3.single('image'), (req: any, res) => {
    return res.status(200).json({ "message": "file successfully upload", data: req.file.location })
});

routes.post('/pdf', userJWT, uploadPdf.single('pdf'), (req: any, res) => {
    return res.status(200).json({ "message": "pdf successfully upload", data: req.file.location })
});

export const uploadRouter = routes
