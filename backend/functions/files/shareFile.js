const { v4: uuid } = require('uuid');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const db = require('../../shared/db');
const res = require('../../shared/response');
const { extractUser, requireRole } = require('../../shared/auth');

const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });
const SENDER = process.env.SES_SENDER_EMAIL || 'michaeljames5595@gmail.com';

exports.handler = async (event) => {
  try {
    const user = extractUser(event);
    requireRole(user, ['StaffMember', 'DepartmentAdmin', 'SystemAdmin']);

    const fileId = event.pathParameters?.fileId;
    const body = JSON.parse(event.body || '{}');
    const { targetDepartment, message, expiresInDays = 7 } = body;

    if (!fileId || !targetDepartment) {
      return res.badRequest('fileId and targetDepartment are required.');
    }

    const doc = await db.get('documents', { documentId: fileId });
    if (!doc) return res.notFound('File not found.');

    const expiresAt = new Date(Date.now() + expiresInDays * 86400000).toISOString();
    const shareId = uuid();

    await db.put('sharedDocuments', {
      shareId,
      documentId: fileId,
      fileName: doc.fileName,
      sourceDepartment: user.department,
      targetDepartment,
      sharedBy: user.userId,
      sharedByEmail: user.email,
      message: message || '',
      expiresAt,
      createdAt: new Date().toISOString(),
    });

    // Send email notification
    try {
      await ses.send(new SendEmailCommand({
        Source: SENDER,
        Destination: { ToAddresses: [SENDER] }, // In production, look up dept admin email
        Message: {
          Subject: { Data: `[CBDFS] File shared with ${targetDepartment}` },
          Body: {
            Text: {
              Data: `${user.email} has shared the file "${doc.fileName}" with the ${targetDepartment} department.\n\n${message ? 'Message: ' + message : ''}\n\nThis share expires on ${expiresAt.slice(0, 10)}.`,
            },
          },
        },
      }));
    } catch (emailErr) {
      console.warn('SES email failed (non-fatal):', emailErr.message);
    }

    await db.put('auditLog', {
      logId: uuid(),
      action: 'SHARE',
      documentId: fileId,
      fileName: doc.fileName,
      department: user.department,
      targetDepartment,
      userId: user.userId,
      userEmail: user.email,
      timestamp: new Date().toISOString(),
      ipAddress: event.requestContext?.identity?.sourceIp || '',
    });

    return res.ok({ shareId, success: true });
  } catch (err) {
    if (err.statusCode === 403) return res.forbidden();
    return res.serverError(err);
  }
};
