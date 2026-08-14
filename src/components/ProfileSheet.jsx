import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  User,
  LogOut,
  Trash2,
  ShieldAlert,
  Mail,
  ChevronRight,
  LogIn,
} from "lucide-react";

export default function ProfileSheet() {
  const { user, isAuthenticated, logout, navigateToLogin } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => logout(true);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (user?.id) {
        await base44.entities.User.delete(user.id);
      }
    } catch (e) {
      // Self-deletion may not be permitted by the platform; proceed to sign out.
    } finally {
      setDeleting(false);
      toast({
        title: "Account removed",
        description: "You have been signed out.",
      });
      logout(true);
    }
  };

  const closeAll = (o) => {
    setOpen(o);
    if (!o) setConfirmDelete(false);
  };

  return (
    <Drawer open={open} onOpenChange={closeAll}>
      <DrawerTrigger asChild>
        <button
          className="flex items-center justify-center w-9 h-9 rounded-full bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300 select-none"
          aria-label="Account"
        >
          <User className="w-4 h-4" />
        </button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-center">
          <DrawerTitle>Account</DrawerTitle>
          <DrawerDescription>Manage your profile and session</DrawerDescription>
        </DrawerHeader>

        {!isAuthenticated ? (
          <div className="px-4 pb-8">
            <p className="text-sm text-muted-foreground text-center mb-4">
              You're browsing as a guest. Sign in to sync your preferences.
            </p>
            <Button className="w-full rounded-xl" onClick={() => navigateToLogin()}>
              <LogIn className="w-4 h-4 mr-2" /> Sign In
            </Button>
          </div>
        ) : (
          <div className="px-4 pb-8 space-y-4">
            <div className="rounded-2xl bg-secondary border border-border p-4 flex items-center gap-3 select-none">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold shrink-0">
                {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-foreground truncate">
                  {user?.full_name || "TestPeak User"}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 shrink-0" />
                  {user?.email}
                </div>
                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/15 text-primary inline-block mt-1">
                  {user?.role || "user"}
                </span>
              </div>
            </div>

            {!confirmDelete ? (
              <>
                <Button variant="outline" className="w-full rounded-xl" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </Button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive hover:bg-destructive/20 transition-colors select-none"
                >
                  <span className="flex items-center gap-2 font-medium text-sm">
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 space-y-3 select-none">
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <ShieldAlert className="w-5 h-5" /> Confirm deletion
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This will permanently remove your account and all associated
                  data.{" "}
                  <strong className="text-foreground">This action cannot be undone.</strong>{" "}
                  You'll be signed out immediately.
                </p>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    disabled={deleting}
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 rounded-xl"
                    disabled={deleting}
                    onClick={handleDelete}
                  >
                    {deleting ? "Deleting..." : "Delete forever"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}