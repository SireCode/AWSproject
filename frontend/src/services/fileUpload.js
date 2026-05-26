import axios from 'axios';
import { filesAPI } from './api';

export async function uploadFileToS3(file, metadata, onProgress) {
  // Step 1: Get presigned upload URL from our API
  const { data } = await filesAPI.getUploadUrl({
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    category: metadata.category,
    description: metadata.description || '',
    accessLevel: metadata.accessLevel,
    department: metadata.department,
  });

  const { uploadUrl, documentId, s3Key } = data;

  // Step 2: PUT directly to S3 using the presigned URL
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: (evt) => {
      if (evt.total) {
        const pct = Math.round((evt.loaded / evt.total) * 100);
        onProgress?.(pct);
      }
    },
  });

  return { documentId, s3Key };
}
