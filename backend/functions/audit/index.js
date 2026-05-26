const db = require('../../shared/db');
const res = require('../../shared/response');
const { extractUser, requireRole } = require('../../shared/auth');

exports.handler = async (event) => {
  try {
    const user = extractUser(event);
    requireRole(user, ['DepartmentAdmin', 'SystemAdmin']);

    const qs = event.queryStringParameters || {};
    const limit = parseInt(qs.limit || '20', 10);
    const lastKey = qs.lastKey ? JSON.parse(decodeURIComponent(qs.lastKey)) : undefined;
    const action = qs.action;
    const startDate = qs.startDate;
    const endDate = qs.endDate;

    const dept = user.role === 'SystemAdmin' && qs.department
      ? qs.department
      : user.department;

    let filterParts = [];
    const exprAttrVals = { ':dept': dept };

    if (action) {
      filterParts.push('action = :act');
      exprAttrVals[':act'] = action;
    }
    if (startDate) {
      filterParts.push('#ts >= :start');
      exprAttrVals[':start'] = startDate;
    }
    if (endDate) {
      filterParts.push('#ts <= :end');
      exprAttrVals[':end'] = endDate + 'T23:59:59Z';
    }

    const queryParams = {
      IndexName: 'department-time-index',
      KeyConditionExpression: 'department = :dept',
      ExpressionAttributeValues: exprAttrVals,
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: lastKey,
    };

    if (filterParts.length) {
      queryParams.FilterExpression = filterParts.join(' AND ');
    }
    if (startDate || endDate) {
      queryParams.ExpressionAttributeNames = { '#ts': 'timestamp' };
    }

    const result = await db.query('auditLog', queryParams);

    return res.ok({
      logs: result.items,
      total: result.items.length,
      lastKey: result.lastKey ? encodeURIComponent(JSON.stringify(result.lastKey)) : null,
    });
  } catch (err) {
    if (err.statusCode === 403) return res.forbidden();
    return res.serverError(err);
  }
};
