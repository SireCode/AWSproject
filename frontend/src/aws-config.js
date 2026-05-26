// Fill in values after each phase completes.
// NEVER commit real secrets — this file is in .gitignore
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'REPLACE_WITH_USER_POOL_ID',
      userPoolClientId: 'REPLACE_WITH_APP_CLIENT_ID',
      region: 'us-east-1',
    }
  },
  API: {
    REST: {
      cbdfsApi: {
        endpoint: 'REPLACE_WITH_API_GATEWAY_URL',
        region: 'us-east-1',
      }
    }
  },
  Storage: {
    S3: {
      bucket: 'dept-file-system-documents-028417007472',
      region: 'us-east-1',
    }
  }
};

export default awsConfig;
