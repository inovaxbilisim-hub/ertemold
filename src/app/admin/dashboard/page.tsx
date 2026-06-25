'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardOverview from '@/modules/admin/components/tabs/DashboardOverview';
import { useAdminData } from '@/app/admin/hooks/useAdminData';

const TAB_ROUTES: Record<string, string> = {
  services: '/admin/content/services',
  references: '/admin/content/references',
  stats: '/admin/content/stats',
  entities: '/admin/system',
};

export default function DashboardPage() {
  const router = useRouter();
  const { services, references, stats } = useAdminData(['services', 'references', 'stats']);

  const handleTabChange = (tab: string) => {
    const route = TAB_ROUTES[tab];
    if (route) router.push(route);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <DashboardOverview
        servicesCount={services.length}
        referencesCount={references.length}
        statsCount={stats.length}
        onTabChange={handleTabChange}
      />
    </motion.div>
  );
}
