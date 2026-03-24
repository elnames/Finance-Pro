'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleGate = ({ children, allowedRoles }: RoleGateProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !allowedRoles.includes(user.plan))) {
      router.replace('/dashboard');
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.plan)) {
    return null;
  }

  return <>{children}</>;
};
