import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Check, X, Plus, DollarSign } from "lucide-react";
import { toast } from "sonner";
import AddUserModal from "./AddUserModal";
import ManageBalanceModal from "./ManageBalanceModal";
import SetLimitsModal from "./SetLimitsModal";

const UserManagement = () => {
  const [isAddUserOpen, setAddUserOpen] = useState(false);
  const [isManageBalanceOpen, setManageBalanceOpen] = useState(false);
  const [isSetLimitsOpen, setSetLimitsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, username, email, status, balance, role_id"); 

      if (profilesError) throw profilesError;

      // Fetch user roles separately
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, role");

      if (rolesError) throw rolesError;

      // Map roles manually
      const usersWithRoles = profiles.map((user) => ({
        ...user,
        role: roles.find((r) => r.id === user.role_id)?.role || "Unknown",
      }));

      return usersWithRoles;
    },
  });

  // Handle user status update
  const handleStatusChange = async (userId, newStatus) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", userId);

      if (error) throw error;
      toast.success(`User ${newStatus} successfully`);
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) return <div>Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <Button onClick={() => setAddUserOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell>${user.balance?.toFixed(2) || "0.00"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {user.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(user.id, "approved")}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(user.id, "rejected")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setManageBalanceOpen(true);
                      }}
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setSetLimitsOpen(true);
                      }}
                    >
                      Set Limits
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isAddUserOpen && <AddUserModal onClose={() => setAddUserOpen(false)} refetch={refetch} />}
      {isManageBalanceOpen && (
        <ManageBalanceModal
          user={selectedUser}
          onClose={() => setManageBalanceOpen(false)}
          refetch={refetch}
        />
      )}
      {isSetLimitsOpen && (
        <SetLimitsModal
          user={selectedUser}
          onClose={() => setSetLimitsOpen(false)}
          refetch={refetch}
        />
      )}
    </div>
  );
};

export default UserManagement;
