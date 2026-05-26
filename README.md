# CBDFS — Cloud-Based Departmental File System

**Student:** Ogunmakin Olalekan Michael | 220903095  
**Institution:** Ekiti State University (EKSU), Ado-Ekiti  
**AWS Region:** us-east-1 (N. Virginia)

## Overview

A full-stack cloud application that allows university departments to upload, organise, retrieve, and share documents securely. Built on AWS with role-based access control (RBAC).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, AWS Amplify UI |
| Hosting | Amazon S3 + CloudFront |
| Auth | Amazon Cognito (User Pools + Groups) |
| API | Amazon API Gateway (REST) |
| Backend | Node.js 20 Lambda (AWS SAM) |
| Database | Amazon DynamoDB |
| Storage | Amazon S3 |
| Email | Amazon SES |
| Audit | AWS CloudTrail |
| IaC | AWS SAM (template.yaml) |

## User Roles

| Role | Permissions |
|------|------------|
| Viewer | Read & download files in own department |
| StaffMember | Upload, download, and share files |
| DepartmentAdmin | Full department management + audit log + delete files |
| SystemAdmin | Institution-wide: manage all departments and users |

## Project Structure

```
dept-file-system/
├── frontend/          # React.js 18 SPA
│   ├── public/
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route-level page components
│       ├── services/     # API & S3 upload helpers
│       ├── context/      # Auth context (Cognito)
│       └── hooks/        # Custom React hooks
├── backend/           # Node.js Lambda functions
│   ├── functions/     # Individual Lambda handlers
│   │   ├── auth/      # Cognito triggers
│   │   ├── files/     # File CRUD + presigned URLs
│   │   ├── users/     # User management
│   │   ├── departments/
│   │   └── audit/
│   └── shared/        # Shared DB, S3, response helpers
├── infrastructure/    # AWS SAM template + seed data
└── scripts/          # Deploy & setup scripts
```

## Local Development Setup

### Prerequisites
- Node.js 20+
- AWS CLI v2 configured
- AWS SAM CLI
- Git

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/SireCode/AWSproject.git
cd dept-file-system

# 2. Install frontend dependencies
cd frontend && npm install && cd ..

# 3. Install backend dependencies
cd backend && npm install && cd ..

# 4. Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, region=us-east-1, format=json

# 5. Deploy backend (after Phases 2–5 AWS setup)
sam build --template infrastructure/template.yaml
sam deploy --guided

# 6. Update frontend/src/aws-config.js with real values from deploy output

# 7. Start frontend
cd frontend && npm start
```

## Deployment

The app is deployed to:
- **API:** AWS API Gateway → Lambda
- **Frontend:** S3 + CloudFront

After running `sam deploy`, capture the outputs and update `frontend/src/aws-config.js`.

## DynamoDB Tables

| Table | Purpose |
|-------|---------|
| cbdfs-users | User profiles |
| cbdfs-documents | File metadata |
| cbdfs-departments | Department records |
| cbdfs-audit-log | Action audit trail |
| cbdfs-access-policy | Access control rules |
| cbdfs-shared-documents | Cross-dept file shares |

## Security

- All S3 buckets are private; files accessed via presigned URLs only
- JWT tokens from Cognito verified on every API request
- Role-based access enforced in Lambda authorizers
- Server-side encryption (AES-256) on document storage bucket
- Versioning enabled on document bucket
