export const getS3Url = (path: string) => {
    const bucket = process.env.AWS_S3_UPLOAD_BUCKET;
    const region = process.env.AWS_REGION;
    
    return `https://${bucket}.s3.${region}.amazonaws.com/${path}`;
  };
  
  // Example usage:
  // getS3Url('posters/oppenheimer.jpg') → 
  // 'https://your-bucket.s3.us-east-2.amazonaws.com/posters/oppenheimer.jpg'
  