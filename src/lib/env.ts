export const validateEnv = () => {
    const required = [
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_S3_UPLOAD_BUCKET'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }
  };
  
  // Call on server startup
  validateEnv();
  