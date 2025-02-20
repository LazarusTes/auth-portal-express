import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface SetLimitsModalProps {
  userId: string;
  currentLimits: {
    daily?: number;
    weekly?: number;
    monthly?: number;
  };
  onLimitsUpdated: () => void;
}

const SetLimitsModal = ({ userId, currentLimits, onLimitsUpdated }: SetLimitsModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [limits, setLimits] = useState({
    daily: currentLimits?.daily || "",
    weekly: currentLimits?.weekly || "",
    monthly: currentLimits?.monthly || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLimits({
      ...limits,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          daily_limit: limits.daily ? Number(limits.daily) : null,
          weekly_limit: limits.weekly ? Number(limits.weekly) : null,
          monthly_limit: limits.monthly ? Number(limits.monthly) : null,
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Limits updated successfully.");
      onLimitsUpdated(); // Refresh user data
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update limits.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Set Limits</Button>
      </DialogTrigger>
      <DialogContent>
        <h2 className="text-xl font-semibold">Set Transaction Limits</h2>
        <p>Set withdrawal and send limits for this user.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="daily">Daily Limit ($)</Label>
            <Input
              id="daily"
              name="daily"
              type="number"
              value={limits.daily}
              onChange={handleInputChange}
              placeholder="No limit"
            />
          </div>
          <div>
            <Label htmlFor="weekly">Weekly Limit ($)</Label>
            <Input
              id="weekly"
              name="weekly"
              type="number"
              value={limits.weekly}
              onChange={handleInputChange}
              placeholder="No limit"
            />
          </div>
          <div>
            <Label htmlFor="monthly">Monthly Limit ($)</Label>
            <Input
              id="monthly"
              name="monthly"
              type="number"
              value={limits.monthly}
              onChange={handleInputChange}
              placeholder="No limit"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Limits"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SetLimitsModal;
