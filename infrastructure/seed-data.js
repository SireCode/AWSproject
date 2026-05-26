const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-east-1' }));

const DEPARTMENTS = [
  { name: 'Computer Science', description: 'Department of Computer Science and Engineering' },
  { name: 'Physics', description: 'Department of Physics and Applied Science' },
  { name: 'Mathematics', description: 'Department of Pure and Applied Mathematics' },
  { name: 'Chemistry', description: 'Department of Chemistry and Industrial Chemistry' },
  { name: 'Statistics', description: 'Department of Statistics and Operations Research' },
];

const ROLES = ['Viewer', 'StaffMember', 'DepartmentAdmin'];
const CATEGORIES = ['Academic', 'Administrative', 'Research', 'Financial', 'Correspondence'];

async function put(TableName, Item) {
  await client.send(new PutCommand({ TableName, Item }));
}

async function seed() {
  console.log('Seeding departments…');

  for (const dept of DEPARTMENTS) {
    const departmentId = randomUUID();
    await put('cbdfs-departments', {
      departmentId,
      name: dept.name,
      description: dept.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 3 test users per department
    for (let i = 0; i < 3; i++) {
      const userId = randomUUID();
      const role = ROLES[i];
      const email = `${role.toLowerCase()}.${dept.name.toLowerCase().replace(/\s/g, '.')}@eksu.edu.ng`;
      await put('cbdfs-users', {
        userId,
        email,
        username: email,
        department: dept.name,
        role,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 5 sample documents per department
    for (let j = 0; j < 5; j++) {
      const docId = randomUUID();
      const cat = CATEGORIES[j % CATEGORIES.length];
      const ext = ['pdf', 'docx', 'xlsx', 'pptx', 'pdf'][j];
      const fileName = `${dept.name.replace(/\s/g, '_')}_${cat}_Sample_${j + 1}.${ext}`;
      await put('cbdfs-documents', {
        documentId: docId,
        fileName,
        fileType: ext === 'pdf' ? 'application/pdf' : 'application/octet-stream',
        fileSize: Math.floor(Math.random() * 5000000) + 100000,
        category: cat,
        description: `Sample ${cat} document for ${dept.name}`,
        accessLevel: 'Department Only',
        department: dept.name,
        s3Key: `${dept.name}/${cat}/${docId}/${fileName}`,
        uploadedBy: 'seed-script',
        uploadedByEmail: `admin.${dept.name.toLowerCase().replace(/\s/g, '.')}@eksu.edu.ng`,
        status: 'active',
        uploadedAt: new Date(Date.now() - j * 86400000 * 3).toISOString(),
      });
    }

    console.log(`  ✓ ${dept.name}`);
  }

  console.log('Seed complete!');
}

seed().catch(err => { console.error(err); process.exit(1); });
