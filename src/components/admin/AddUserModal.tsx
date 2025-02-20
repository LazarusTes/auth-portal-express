import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface AddUserModalProps {
  onUserAdded: () => void; // Function to refresh the user list
}

const AddUserModal = ({ onUserAdded }: AddUserModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "user",
    dateOfBirth: "",
    placeOfBirth: "",
    residence: "",
    nationality: "",
    idCard: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, idCard: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
      });

      if (authError || !authData.user) throw authError || new Error("User creation failed");

      const userId = authData.user.id;
      let idCardUrl = null;

      // 2. Upload ID Card (if provided)
      if (formData.idCard) {
        const fileExt = formData.idCard.name.split(".").pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("id-cards").upload(fileName, formData.idCard);
        if (uploadError) throw uploadError;

        // Get public URL
        const { data: publicUrlData } = supabase.storage.from("id-cards").getPublicUrl(fileName);
        idCardUrl = publicUrlData.publicUrl;
      }

      // 3. Insert user profile into the database
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        date_of_birth: formData.dateOfBirth,
        place_of_birth: formData.placeOfBirth,
        residence: formData.residence,
        nationality: formData.nationality,
        id_card_url: idCardUrl,
        status: "approved", // Auto-approved
      });

      if (profileError) throw profileError;

      // 4. Assign role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: formData.role,
      });

      if (roleError) throw roleError;

      toast.success("User added successfully!");
      onUserAdded(); // Refresh user list
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add New User</Button>
      </DialogTrigger>
      <DialogContent>
        <h2 className="text-xl font-semibold">Add New User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
            </div>
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <select id="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required className="w-full border rounded-md p-2">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <Label htmlFor="idCard">Upload ID Card</Label>
            <Input id="idCard" type="file" onChange={handleFileChange} accept="image/*,.pdf" required />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
