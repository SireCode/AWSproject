const { v4: uuid } = require('uuid');
const db = require('../../shared/db');
const s3 = require('../../shared/s3');
const res = require('../../shared/response');
const { extractUser, requireRole } = require('../../shared/auth');

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
];
const MAX_SIZE = 52428800; // 50 MB

exports.handler = async (event) => {
  try {
    const user = extractUser(event);
    requireRole(user, ['StaffMember', 'DepartmentAdmin', 'SystemAdmin']);

    const body = JSON.parse(event.body || '{}');
    const { fileName, fileType, fileSize, category, description, accessLevel, department } = body;

    if (!fileName || !fileType || !fileSize || !category) {
      return res.badRequest('fileName, fileType, fileSize, and category are required.');
    }
    if (!ALLOWED_TYPES.includes(fileType)) {
      return res.badRequest('File type not allowed.');
    }
    if (fileSize > MAX_SIZE) {
      return res.badRequest('File exceeds 50 MB limit.');
    }

    const documentId = uuid();
    const dept = department || user.department;
    const s3Key = `${dept}/${category}/${documentId}/${fileName}`;

    const uploadUrl = await s3.generateUploadUrl(s3Key, fileType);

    const docItem = {
      documentId,
      fileName,
      fileType,
      fileSize,
      category,
      description: description || '',
      accessLevel: accessLevel || 'Department Only',
      department: dept,
      s3Key,
      uploadedBy: user.userId,
      uploadedByEmail: user.email,
      status: 'pending',
      uploadedAt: new Date().toISOString(),
    };
    await db.put('documents', docItem);

    await db.put('auditLog', {
      logId: uuid(),
      action: 'UPLOAD_INITIATED',
      documentId,
      fileName,
      department: dept,
      userId: user.userId,
      userEmail: user.email,
      timestamp: new Date().toISOString(),
      ipAddress: event.requestContext?.identity?.sourceIp || '',
    });

    return res.ok({ uploadUrl, documentId, s3Key });
  } catch (err) {
    if (err.statusCode === 403) return res.forbidden();
    return res.serverError(err);
  }
};
