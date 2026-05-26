const {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const db = require('../../shared/db');

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || 'us-east-1' });

exports.handler = async (event) => {
  const { sub, email } = event.request.userAttributes;
  const department = event.request.userAttributes['custom:department'] || '';
  const userPoolId = event.userPoolId;

  try {
    // Save user profile to DynamoDB
    await db.put('users', {
      userId: sub,
      email,
      username: event.userName,
      department,
      role: 'Viewer',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Auto-add user to Viewer group
    await cognito.send(new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: event.userName,
      GroupName: 'Viewer',
    }));
  } catch (err) {
    console.error('PostConfirmation error:', err);
    // Don't throw — returning normally lets Cognito complete the flow
  }

  return event;
};
