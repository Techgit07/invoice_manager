import multer from 'multer'
import AWS from 'aws-sdk';
import multerS3 from 'multer-s3'
import config from 'config';
import { S3Client } from '@aws-sdk/client-s3'

const aws: any = config.get("aws");
// const s3 = new AWS.S3({
//     region: aws.bucket_region,
//     accessKeyId: aws.access_key,
//     secretAccessKey: aws.secret_key
// })

const S3 = new S3Client({
    region: aws.bucket_region,
    credentials: {
        accessKeyId: aws.access_key,
        secretAccessKey: aws.secret_key
    },
})

const bucket_name = aws.bucket_name
const bucket_URL = aws.bucket_url

export const uploadS3 = multer({
    storage: multerS3({
        s3: S3,
        bucket: bucket_name,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req: any, file, cb) => {
            cb(null, { fieldName: file.fieldname })
        },
        key: (req: any, file, cb) => {
            const file_type = file.originalname.split('.');
            req.body.location = `${bucket_URL}/${req.header('user')?._id}/${Date.now().toString()}.${file_type[file_type.length - 1]}`
            cb(null, `expense/${req.header('user')?._id}/${Date.now().toString()}.${file_type[file_type.length - 1]}`)
        }
    })
})

export const uploadPdf = multer({
    storage: multerS3({
        s3: S3,
        bucket: bucket_name,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req: any, pdf, cb) => {
            cb(null, { fieldName: pdf.fieldname })
        },
        key: (req: any, pdf, cb) => {
            const pdf_type = pdf.originalname.split('.');
            req.body.location = `${bucket_URL}/${req.header('user')?._id}.${pdf_type[pdf_type.length - 1]}`
            cb(null, `pdf/${req.header('user')?._id}.${pdf_type[pdf_type.length - 1]}`)
        }
    })
})

// export const upload_allType = async (image, bucketPath) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             var params = {
//                 Bucket: `${bucket_name}/${bucketPath}`,
//                 Key: image.name,
//                 Body: image.data,
//                 ContentType: image.mimetype,
//                 ACL: 'public-read'
//             }
//             s3.upload(params, (error, data) => {
//                 if (error) {
//                     console.log(error);
//                     reject();
//                 } else {
//                     resolve(data.Location);
//                     console.log("--->>>Data", data);
//                 }
//             })
//         } catch (error) {
//             console.log(error);
//             reject();
//         }
//     })
// }


