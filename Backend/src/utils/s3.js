import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'private',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const fileName = `pdfs/${Date.now()}_${file.originalname}`;
      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf')
    ) cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
}); 