import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock',
  },
});

const BUCKET = process.env.AWS_S3_BUCKET || 'streamverse-raw-videos';

export const initiateMultipartUpload = async (key: string) => {
  if (process.env.AWS_ACCESS_KEY_ID === 'mock') {
    return 'mock_upload_id_' + Date.now();
  }
  const cmd = new CreateMultipartUploadCommand({ Bucket: BUCKET, Key: key });
  const res = await s3.send(cmd);
  return res.UploadId!;
};

export const generatePresignedUrlsForParts = async (key: string, uploadId: string, partsCount: number) => {
  const urls = [];
  for (let i = 1; i <= partsCount; i++) {
    if (process.env.AWS_ACCESS_KEY_ID === 'mock') {
      urls.push(`https://mock-s3.com/${BUCKET}/${key}?partNumber=${i}&uploadId=${uploadId}`);
      continue;
    }
    const cmd = new UploadPartCommand({ Bucket: BUCKET, Key: key, UploadId: uploadId, PartNumber: i });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
    urls.push(url);
  }
  return urls;
};

export const completeMultipartUpload = async (key: string, uploadId: string, parts: { ETag: string; PartNumber: number }[]) => {
  if (process.env.AWS_ACCESS_KEY_ID === 'mock') {
    return `s3://${BUCKET}/${key}`;
  }
  const cmd = new CompleteMultipartUploadCommand({
    Bucket: BUCKET,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  });
  await s3.send(cmd);
  return `s3://${BUCKET}/${key}`;
};

export const generatePresignedUrl = async (bucket: string, key: string, expiresIn = 3600) => {
  if (process.env.AWS_ACCESS_KEY_ID === 'mock') {
    return `https://mock-s3.com/${bucket}/${key}`;
  }
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return await getSignedUrl(s3, cmd, { expiresIn });
};

export const generateCloudFrontUrl = (key: string) => {
  // In a real scenario, this would use CloudFront signer
  const domain = process.env.CLOUDFRONT_DOMAIN || 'd123.cloudfront.net';
  return `https://${domain}/${key}`;
};
