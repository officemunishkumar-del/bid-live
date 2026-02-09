import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      } else {
        await register(formData.email, formData.password, formData.name);
        toast({
          title: "Account created!",
          description: "Welcome to LiveBid.",
        });
      }
      onOpenChange(false);
      setFormData({ name: "", email: "", password: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
        <div className="flex min-h-[500px]">
          {/* Left image */}
          <div className="hidden md:block w-1/2 relative">
            <img
              src="https://images.unsplash.com/photo-1515562141589-67f0d569b6f5?w=600"
              alt="Featured auction"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/60 flex items-end p-6">
              <p className="text-primary-foreground text-lg font-serif">Discover extraordinary treasures from world-class auction houses</p>
            </div>
          </div>

          {/* Right form */}
          <div className="flex-1 p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
              {isLogin ? "Welcome Back!" : "Join LiveBid"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {isLogin ? "Log in to your account" : "Create your free account"}
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label className="text-xs font-medium text-foreground uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required={!isLogin}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-foreground uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  required
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground uppercase tracking-wide">Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-md bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLogin ? "LOG IN" : "CREATE ACCOUNT"}
              </button>
            </form>

            {isLogin && (
              <button className="text-xs text-primary mt-3 hover:underline">Forgot Password?</button>
            )}

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-2">
              <button className="w-full h-10 rounded-md border border-input bg-background text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2">
                <span>G</span> Continue with Google
              </button>
              <button className="w-full h-10 rounded-md border border-input bg-background text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2">
                <span></span> Continue with Apple
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-5 text-center">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
                {isLogin ? "Join" : "Log In"}
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
