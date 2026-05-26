const { v4: uuid } = require('uuid');
const db = require('../../shared/db');
const s3 = require('../../shared/s3');
const res = require('../../shared/response');
const { extractUser, requireRole } = require('../../shared/auth');

exports.handler = async (event) => {
  try {
    const user = extractUser(event);
    requireRole(user, ['DepartmentAdmin', 'SystemAdmin']);

    const fileId = event.pathParameters?.fileId;
    if (!fileId) return res.badRequest('fileId is required.');

    const doc = await db.get('documents', { documentId: fileId });
    if (!doc) return res.notFound('File not found.');

    if (user.role !== 'SystemAdmin' && doc.department !== user.department) {
      return res.forbidden();
    }

    await s3.deleteObject(doc.s3Key);
    await db.remove('documents', { documentId: fileId });

    await db.put('auditLog', {
      logId: uuid(),
      action: 'DELETE',
      documentId: fileId,
      fileName: doc.fileName,
      department: doc.department,
      userId: user.userId,
      userEmail: user.email,
      timestamp: new Date().toISOString(),
      ipAddress: event.requestContext?.identity?.sourceIp || '',
    });

    return res.ok({ success: true, message: 'File deleted.' });
  } catch (err) {
    if (err.statusCode === 403) return res.forbidden();
    return res.serverError(err);
  }
};
