import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="mt-16 p-8 bg-cloud-white min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};
