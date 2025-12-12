import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';

type UserRole = 'viewer' | 'member' | 'admin' | 'super_admin';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

const roleHierarchy: Record<UserRole, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
  super_admin: 4,
};

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && role) {
    const userRoleLevel = roleHierarchy[role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div className="container max-w-7xl mx-auto p-4">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
}
