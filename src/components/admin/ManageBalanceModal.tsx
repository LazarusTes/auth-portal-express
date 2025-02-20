import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface ManageBalanceModalProps {
  userId: string;
  currentBalance: number;
  onBalanceUpdated: () => void;
}

const ManageBalanceModal = ({ userId, currentBalance, onBalanceUpdated }: ManageBalanceModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState("add"); // "add" or "deduct"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      toast.error("Please enter a valid amount.");
      setIsLoading(false);
      return;
    }

    let newBalance = currentBalance;
    if (action === "add") {
      newBalance += amountNumber;
    } else if (action === "deduct") {
      if (amountNumber > currentBalance) {
        toast.error("Insufficient balance.");
        setIsLoading(false);
        return;
      }
      newBalance -= amountNumber;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`Balance successfully ${action === "add" ? "added" : "deducted"}.`);
      onBalanceUpdated(); // Refresh user data
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update balance.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Balance</Button>
      </DialogTrigger>
      <DialogContent>
        <h2 className="text-xl font-semibold">Manage Balance</h2>
        <p>Current Balance: <strong>${currentBalance.toFixed(2)}</strong></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Action</Label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              required
              className="w-full border rounded-md p-2"
            >
              <option value="add">Add Balance</option>
              <option value="deduct">Deduct Balance</option>
            </select>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Update Balance"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManageBalanceModal;
