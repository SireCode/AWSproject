const { v4: uuid } = require('uuid');
const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  AdminListGroupsForUserCommand,
  AdminDisableUserCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const db = require('../../shared/db');
const res = require('../../shared/response');
const { extractUser, requireRole } = require('../../shared/auth');

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || 'us-east-1' });
const USER_POOL_ID = process.env.USER_POOL_ID;

exports.handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path || '';
  const userId = event.pathParameters?.userId;

  try {
    const user = extractUser(event);

    // GET /users
    if (method === 'GET' && !userId) {
      requireRole(user, ['DepartmentAdmin', 'SystemAdmin']);
      const dept = user.role === 'SystemAdmin'
        ? (event.queryStringParameters?.department)
        : user.department;

      let result;
      if (dept) {
        result = await db.query('users', {
          IndexName: 'department-index',
          KeyConditionExpression: 'department = :dept',
          ExpressionAttributeValues: { ':dept': dept },
        });
      } else {
        result = await db.scan('users');
      }
      return res.ok({ users: result.items });
    }

    // PUT /users/{userId}/role
    if (method === 'PUT' && path.includes('/role')) {
      requireRole(user, ['SystemAdmin']);
      const body = JSON.parse(event.body || '{}');
      const newRole = body.role;
      if (!newRole) return res.badRequest('role is required.');

      const targetUser = await db.get('users', { userId });
      if (!targetUser) return res.notFound('User not found.');

      const groupsRes = await cognito.send(new AdminListGroupsForUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: targetUser.email,
      }));

      for (const g of (groupsRes.Groups || [])) {
        await cognito.send(new AdminRemoveUserFromGroupCommand({
          UserPoolId: USER_POOL_ID,
          Username: targetUser.email,
          GroupName: g.GroupName,
        }));
      }

      await cognito.send(new AdminAddUserToGroupCommand({
        UserPoolId: USER_POOL_ID,
        Username: targetUser.email,
        GroupName: newRole,
      }));

      await db.update('users', { userId }, 'SET #r = :r, updatedAt = :u',
        { ':r': newRole, ':u': new Date().toISOString() }, { '#r': 'role' });

      return res.ok({ success: true });
    }

    // DELETE /users/{userId}
    if (method === 'DELETE' && userId) {
      requireRole(user, ['SystemAdmin']);
      const targetUser = await db.get('users', { userId });
      if (!targetUser) return res.notFound('User not found.');

      await cognito.send(new AdminDisableUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: targetUser.email,
      }));

      await db.update('users', { userId }, 'SET #s = :s, updatedAt = :u',
        { ':s': 'disabled', ':u': new Date().toISOString() }, { '#s': 'status' });

      return res.ok({ success: true });
    }

    return res.notFound('Route not found.');
  } catch (err) {
    if (err.statusCode === 403) return res.forbidden();
    return res.serverError(err);
  }
};
