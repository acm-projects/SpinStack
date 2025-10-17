const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();

console.log('AWS_ACCESS_KEY:', process.env.AWS_ACCESS_KEY);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'set' : 'undefined');
console.log('AWS_REGION:', process.env.AWS_REGION);

// Single S3 client for both routes
const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// --------------------
// POST /api/upload/presigned-url
// Generate presigned URL for uploading an image
// --------------------
router.post('/presigned-url', async (req, res) => {
    console.log('Body received:', req.body); // check what backend sees

    try {
        const { fileName, fileType } = req.body;

        if (!fileName || !fileType) {
            return res.status(400).json({ error: 'fileName and fileType are required' });
        }

        const params = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            ContentType: fileType,
            Expires: 300, // URL valid for 5 minutes
        };

        const uploadURL = await s3.getSignedUrlPromise('putObject', params);
        console.log('Generated presigned URL:', uploadURL);
        res.json({ uploadURL });
    } catch (err) {
        console.error('Error generating presigned upload URL:', err);
        res.status(500).json({ error: 'Failed to generate upload URL' });
    }
});

// --------------------
// GET /api/upload/download-url
// Generate presigned URL for downloading an image
// --------------------
router.get('/download-url/:filename', async (req, res) => {
    try {
        const { filename } = req.params;

        if (!filename) {
            return res.status(400).json({ error: 'fileName query parameter is required' });
        }

        const params = {
            Bucket: BUCKET_NAME,
            Key: filename,
            Expires: 300, // URL valid for 5 minutes
        };

        const downloadURL = await s3.getSignedUrlPromise('getObject', params);
        res.json({ downloadURL });
    } catch (err) {
        console.error('Error generating presigned download URL:', err);
        res.status(500).json({ error: 'Failed to generate download URL' });
    }
});

module.exports = router;
