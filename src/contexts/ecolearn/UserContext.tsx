import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'policymaker' | 'field_operator' | 'citizen';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  zone?: string;
  department?: string;
}

interface UserContextType {
  user: User | null;
  userRole: UserRole;
  setUser: (user: User | null) => void;
  setUserRole: (role: UserRole) => void;
  hasPermission: (permission: string) => boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUsers: User[] = [
  {
    id: 'admin-001',
    name: 'System Administrator',
    email: 'admin@wastemanagement.gov',
    role: 'admin',
    permissions: ['view_all', 'edit_all', 'delete_all', 'manage_users', 'view_analytics', 'export_data'],
    department: 'IT Department'
  },
  {
    id: 'policy-001',
    name: 'Policy Director',
    email: 'policy@wastemanagement.gov',
    role: 'policymaker',
    permissions: ['view_analytics', 'view_reports', 'export_data', 'view_compliance'],
    department: 'Policy Department'
  },
  {
    id: 'field-001',
    name: 'Field Supervisor',
    email: 'field@wastemanagement.gov',
    role: 'field_operator',
    permissions: ['view_operations', 'edit_schedules', 'view_bins', 'view_vehicles'],
    zone: 'North Zone',
    department: 'Operations'
  },
  {
    id: 'citizen-001',
    name: 'Community Member',
    email: 'citizen@example.com',
    role: 'citizen',
    permissions: ['view_public_info', 'submit_reports'],
    zone: 'North Zone'
  }
];

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(defaultUsers[0]); // Default to admin
  const [userRole, setUserRole] = useState<UserRole>('admin');

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const isAuthenticated = user !== null;

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in production, this would call an API
    const foundUser = defaultUsers.find(u => u.email === email);
    if (foundUser && password === 'password') { // Mock password check
      setUser(foundUser);
      setUserRole(foundUser.role);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setUserRole('citizen');
  };

  const handleSetUserRole = (role: UserRole) => {
    setUserRole(role);
    // Update user object to match the role
    const roleUser = defaultUsers.find(u => u.role === role);
    if (roleUser) {
      setUser(roleUser);
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      userRole,
      setUser,
      setUserRole: handleSetUserRole,
      hasPermission,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};