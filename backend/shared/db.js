const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient, GetCommand, PutCommand,
  QueryCommand, DeleteCommand, UpdateCommand, ScanCommand,
} = require('@aws-sdk/lib-dynamodb');

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' }));

const TABLES = {
  users: process.env.USERS_TABLE || 'cbdfs-users',
  documents: process.env.DOCUMENTS_TABLE || 'cbdfs-documents',
  departments: process.env.DEPARTMENTS_TABLE || 'cbdfs-departments',
  auditLog: process.env.AUDIT_LOG_TABLE || 'cbdfs-audit-log',
  accessPolicy: process.env.ACCESS_POLICY_TABLE || 'cbdfs-access-policy',
  sharedDocuments: process.env.SHARED_DOCUMENTS_TABLE || 'cbdfs-shared-documents',
};

async function get(table, key) {
  const res = await client.send(new GetCommand({ TableName: TABLES[table], Key: key }));
  return res.Item;
}

async function put(table, item) {
  await client.send(new PutCommand({ TableName: TABLES[table], Item: item }));
  return item;
}

async function query(table, params) {
  const res = await client.send(new QueryCommand({ TableName: TABLES[table], ...params }));
  return { items: res.Items || [], lastKey: res.LastEvaluatedKey };
}

async function scan(table, params = {}) {
  const res = await client.send(new ScanCommand({ TableName: TABLES[table], ...params }));
  return { items: res.Items || [], lastKey: res.LastEvaluatedKey };
}

async function remove(table, key) {
  await client.send(new DeleteCommand({ TableName: TABLES[table], Key: key }));
}

async function update(table, key, updateExpr, exprAttrValues, exprAttrNames) {
  const res = await client.send(new UpdateCommand({
    TableName: TABLES[table],
    Key: key,
    UpdateExpression: updateExpr,
    ExpressionAttributeValues: exprAttrValues,
    ExpressionAttributeNames: exprAttrNames,
    ReturnValues: 'ALL_NEW',
  }));
  return res.Attributes;
}

module.exports = { get, put, query, scan, remove, update, TABLES };
