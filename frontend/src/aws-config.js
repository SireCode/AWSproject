// Fill in values after each phase completes.
// NEVER commit real secrets — this file is in .gitignore
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_O9B0oWl3v',
      userPoolClientId: '49fmgmo72hgprlenovh243ktc0',
      region: 'us-east-1',
    }
  },
  API: {
    REST: {
      cbdfsApi: {
        endpoint: 'https://7nn7l376z3.execute-api.us-east-1.amazonaws.com/Prod',
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
