import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, fetchUserAttributes, fetchAuthSession, signOut } from 'aws-amplify/auth';

const AuthContext = createContext(null);

const ROLE_PRIORITY = ['SystemAdmin', 'DepartmentAdmin', 'StaffMember', 'Viewer'];

function extractRoleFromGroups(groups = []) {
  for (const role of ROLE_PRIORITY) {
    if (groups.includes(role)) return role;
  }
  return 'Viewer';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  async function checkAuth() {
    try {
      const cognitoUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const session = await fetchAuthSession();

      const groups =
        session?.tokens?.idToken?.payload?.['cognito:groups'] || [];

      const resolvedRole = extractRoleFromGroups(groups);

      const email = attributes.email || '';
      const displayName = attributes.name || email.split('@')[0];

      setUser({
        userId: cognitoUser.userId,
        username: cognitoUser.username,
        name: displayName,
        email,
        department: attributes['custom:department'] || '',
      });
      setRole(resolvedRole);
    } catch {
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  async function logout() {
    await signOut();
    setUser(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
