const { v4: uuid } = require('uuid');
const db = require('../../shared/db');
const res = require('../../shared/response');
const { extractUser, requireRole } = require('../../shared/auth');

exports.handler = async (event) => {
  const method = event.httpMethod;
  const deptId = event.pathParameters?.departmentId;

  try {
    const user = extractUser(event);

    if (method === 'GET') {
      const result = await db.scan('departments');
      return res.ok({ departments: result.items });
    }

    if (method === 'POST') {
      requireRole(user, ['SystemAdmin']);
      const body = JSON.parse(event.body || '{}');
      if (!body.name) return res.badRequest('name is required.');
      const dept = {
        departmentId: uuid(),
        name: body.name,
        description: body.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.put('departments', dept);
      return res.created(dept);
    }

    if (method === 'PUT' && deptId) {
      requireRole(user, ['SystemAdmin']);
      const body = JSON.parse(event.body || '{}');
      const updated = await db.update(
        'departments',
        { departmentId: deptId },
        'SET #n = :n, description = :d, updatedAt = :u',
        { ':n': body.name, ':d': body.description || '', ':u': new Date().toISOString() },
        { '#n': 'name' }
      );
      return res.ok(updated);
    }

    if (method === 'DELETE' && deptId) {
      requireRole(user, ['SystemAdmin']);
      await db.remove('departments', { departmentId: deptId });
      return res.ok({ success: true });
    }

    return res.notFound('Route not found.');
  } catch (err) {
    if (err.statusCode === 403) return res.forbidden();
    return res.serverError(err);
  }
};
