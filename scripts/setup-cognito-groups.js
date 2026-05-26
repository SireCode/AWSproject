const {
  CognitoIdentityProviderClient,
  CreateGroupCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const USER_POOL_ID = process.argv[2];
if (!USER_POOL_ID) {
  console.error('Usage: node setup-cognito-groups.js <USER_POOL_ID>');
  process.exit(1);
}

const cognito = new CognitoIdentityProviderClient({ region: 'us-east-1' });

const GROUPS = [
  { GroupName: 'Viewer', Description: 'Read-only access to department files' },
  { GroupName: 'StaffMember', Description: 'Upload and manage files' },
  { GroupName: 'DepartmentAdmin', Description: 'Department management and audit access' },
  { GroupName: 'SystemAdmin', Description: 'Institution-wide administration' },
];

async function createGroups() {
  for (const group of GROUPS) {
    try {
      await cognito.send(new CreateGroupCommand({ ...group, UserPoolId: USER_POOL_ID }));
      console.log(`✓ Created group: ${group.GroupName}`);
    } catch (err) {
      if (err.name === 'GroupExistsException') {
        console.log(`  (already exists): ${group.GroupName}`);
      } else {
        console.error(`✗ Failed to create ${group.GroupName}:`, err.message);
      }
    }
  }
  console.log('Done!');
}

createGroups();
