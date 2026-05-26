import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Upload from './pages/Upload';
import AdminPanel from './pages/AdminPanel';
import AuditLog from './pages/AuditLog';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route path="/documents" element={
            <PrivateRoute>
              <Documents />
            </PrivateRoute>
          } />

          <Route path="/upload" element={
            <PrivateRoute roles={['StaffMember', 'DepartmentAdmin', 'SystemAdmin']}>
              <Upload />
            </PrivateRoute>
          } />

          <Route path="/admin" element={
            <PrivateRoute roles={['DepartmentAdmin', 'SystemAdmin']}>
              <AdminPanel />
            </PrivateRoute>
          } />

          <Route path="/audit" element={
            <PrivateRoute roles={['DepartmentAdmin', 'SystemAdmin']}>
              <AuditLog />
            </PrivateRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
