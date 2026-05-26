const db = require('../../shared/db');
const res = require('../../shared/response');
const { extractUser } = require('../../shared/auth');

const ACCESS_ROLE = {
  'Department Only': ['Viewer', 'StaffMember', 'DepartmentAdmin', 'SystemAdmin'],
  'Staff Only': ['StaffMember', 'DepartmentAdmin', 'SystemAdmin'],
  'Admin Only': ['DepartmentAdmin', 'SystemAdmin'],
};

exports.handler = async (event) => {
  try {
    const user = extractUser(event);
    const qs = event.queryStringParameters || {};
    const limit = parseInt(qs.limit || '20', 10);
    const category = qs.category;
    const lastKey = qs.lastKey ? JSON.parse(decodeURIComponent(qs.lastKey)) : undefined;

    const dept = user.role === 'SystemAdmin' && qs.department
      ? qs.department
      : user.department;

    let filterExpr = '';
    const exprAttrVals = { ':dept': dept };

    if (category) {
      filterExpr = 'category = :cat';
      exprAttrVals[':cat'] = category;
    }

    const result = await db.query('documents', {
      IndexName: 'department-date-index',
      KeyConditionExpression: 'department = :dept',
      ExpressionAttributeValues: exprAttrVals,
      FilterExpression: filterExpr || undefined,
      Limit: limit,
      ExclusiveStartKey: lastKey,
      ScanIndexForward: false,
    });

    const filtered = result.items.filter(doc => {
      const allowed = ACCESS_ROLE[doc.accessLevel] || ACCESS_ROLE['Department Only'];
      return allowed.includes(user.role);
    });

    return res.ok({
      files: filtered,
      total: filtered.length,
      lastKey: result.lastKey ? encodeURIComponent(JSON.stringify(result.lastKey)) : null,
    });
  } catch (err) {
    return res.serverError(err);
  }
};
