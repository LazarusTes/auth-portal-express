
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const AdminPortal = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Admin Portal</h1>
          <Button
            variant="outline"
            onClick={() => {
              // TODO: Implement logout
              navigate("/signin");
            }}
          >
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-medium">User Management</h2>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
            <Button className="w-full">View Users</Button>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-medium">Settings</h2>
            <p className="text-muted-foreground">Configure system settings and preferences</p>
            <Button className="w-full">Manage Settings</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
