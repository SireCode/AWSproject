import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';
import awsConfig from '../aws-config';

const BASE_URL = awsConfig.API.REST.cbdfsApi.endpoint;

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session?.tokens?.idToken?.toString();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // unauthenticated request — let it through
  }
  return config;
});

export const filesAPI = {
  list: (params) => api.get('/files', { params }),
  getDownloadUrl: (fileId) => api.get(`/files/${fileId}/download`),
  getUploadUrl: (body) => api.post('/files/upload-url', body),
  delete: (fileId) => api.delete(`/files/${fileId}`),
  share: (fileId, body) => api.post(`/files/${fileId}/share`, body),
};

export const departmentsAPI = {
  list: () => api.get('/departments'),
  create: (body) => api.post('/departments', body),
  update: (id, body) => api.put(`/departments/${id}`, body),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const usersAPI = {
  list: (params) => api.get('/users', { params }),
  updateRole: (userId, role) => api.put(`/users/${userId}/role`, { role }),
  delete: (userId) => api.delete(`/users/${userId}`),
};

export const auditAPI = {
  list: (params) => api.get('/audit', { params }),
};

export default api;
