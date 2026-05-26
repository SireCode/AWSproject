function extractUser(event) {
  const claims = event?.requestContext?.authorizer?.claims || {};
  const groups = claims['cognito:groups']
    ? claims['cognito:groups'].split(',')
    : [];

  const ROLE_PRIORITY = ['SystemAdmin', 'DepartmentAdmin', 'StaffMember', 'Viewer'];
  const role = ROLE_PRIORITY.find(r => groups.includes(r)) || 'Viewer';

  return {
    userId: claims.sub || '',
    email: claims.email || '',
    username: claims['cognito:username'] || claims.email || '',
    department: claims['custom:department'] || '',
    role,
    groups,
  };
}

function requireRole(user, allowedRoles) {
  if (!allowedRoles.includes(user.role)) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }
}

module.exports = { extractUser, requireRole };
