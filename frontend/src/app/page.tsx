/**
 * Agri-Nexus Home Page
 * ====================
 * Main entry point - displays the Digital Twin Dashboard
 */

import DashboardClient from '@/components/dashboard/DashboardClient';
import SimControlPanel from '@/components/dashboard/SimControlPanel';

export default function Home() {
  // Default farm ID for demo
  const farmId = 'demo-farm-001';

  return (
    <>
      <DashboardClient farmId={farmId} />
      <SimControlPanel />
    </>
  );
}
