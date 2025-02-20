
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, PiggyBank, ArrowDownToLine, ArrowUpFromLine, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import UserManagement from "@/components/admin/UserManagement";

const AdminPortal = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('users');

  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleData?.role !== 'admin') {
        navigate('/portal');
      }
    };

    checkAdminRole();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return <UserManagement />;
      default:
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-semibold mb-4">Welcome, Admin</h1>
            <p className="text-gray-600">Select an option from the sidebar to manage your platform.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-4 space-y-4">
            <h2 className="text-xl font-semibold px-4 mb-6">Admin Portal</h2>
            <Button 
              variant={activeView === 'users' ? 'default' : 'ghost'} 
              className="w-full justify-start" 
              onClick={() => setActiveView('users')}
            >
              <Users className="mr-2" />
              Users Management
            </Button>
            <Button 
              variant={activeView === 'deposits' ? 'default' : 'ghost'} 
              className="w-full justify-start" 
              onClick={() => setActiveView('deposits')}
            >
              <ArrowDownToLine className="mr-2" />
              Deposit Requests
            </Button>
            <Button 
              variant={activeView === 'withdrawals' ? 'default' : 'ghost'} 
              className="w-full justify-start" 
              onClick={() => setActiveView('withdrawals')}
            >
              <ArrowUpFromLine className="mr-2" />
              Withdrawal Requests
            </Button>
            <Button 
              variant={activeView === 'sends' ? 'default' : 'ghost'} 
              className="w-full justify-start" 
              onClick={() => setActiveView('sends')}
            >
              <Send className="mr-2" />
              Send Requests
            </Button>
            <div className="pt-4">
              <Button variant="outline" className="w-full" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
