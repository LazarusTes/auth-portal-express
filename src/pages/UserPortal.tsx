
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PiggyBank, ArrowUpFromLine, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

const UserPortal = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
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

      if (roleData?.role === 'admin') {
        navigate('/admin');
      }
    };

    checkUserRole();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-4 space-y-4">
            <h2 className="text-xl font-semibold px-4 mb-6">User Portal</h2>
            <Button variant="ghost" className="w-full justify-start" onClick={() => {}}>
              <PiggyBank className="mr-2" />
              Deposit
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => {}}>
              <ArrowUpFromLine className="mr-2" />
              Withdraw
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => {}}>
              <Send className="mr-2" />
              Send
            </Button>
            <div className="pt-4">
              <Button variant="outline" className="w-full" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-semibold mb-4">Welcome to Your Dashboard</h1>
              <p className="text-gray-600">Select an option from the sidebar to manage your account.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPortal;
