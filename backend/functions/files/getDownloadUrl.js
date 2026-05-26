const { v4: uuid } = require('uuid');
const db = require('../../shared/db');
const s3 = require('../../shared/s3');
const res = require('../../shared/response');
const { extractUser } = require('../../shared/auth');

exports.handler = async (event) => {
  try {
    const user = extractUser(event);
    const fileId = event.pathParameters?.fileId;
    if (!fileId) return res.badRequest('fileId is required.');

    const doc = await db.get('documents', { documentId: fileId });
    if (!doc) return res.notFound('File not found.');

    // Check access: same department OR file was shared with user
    const sameDept = doc.department === user.department;
    const isAdmin = user.role === 'SystemAdmin';

    if (!sameDept && !isAdmin) {
      // Check shared documents
      const shared = await db.query('sharedDocuments', {
        IndexName: 'document-target-index',
        KeyConditionExpression: 'documentId = :did',
        FilterExpression: 'targetDepartment = :dept',
        ExpressionAttributeValues: { ':did': fileId, ':dept': user.department },
      });
      if (!shared.items.length) return res.forbidden();
    }

    const downloadUrl = await s3.generateDownloadUrl(doc.s3Key, 900);

    await db.put('auditLog', {
      logId: uuid(),
      action: 'DOWNLOAD',
      documentId: fileId,
      fileName: doc.fileName,
      department: doc.department,
      userId: user.userId,
      userEmail: user.email,
      timestamp: new Date().toISOString(),
      ipAddress: event.requestContext?.identity?.sourceIp || '',
    });

    return res.ok({ downloadUrl, fileName: doc.fileName, expiresIn: 900 });
  } catch (err) {
    if (err.statusCode === 403) return res.forbidden();
    return res.serverError(err);
  }
};
