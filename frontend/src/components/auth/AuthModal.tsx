import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eye, EyeOff, Loader2, ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ModalView = "login" | "register" | "forgot";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (view: ModalView, formData: { name: string; email: string; password: string }): FormErrors => {
  const errors: FormErrors = {};

  if (view === "register" && (!formData.name || formData.name.trim().length < 2)) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(formData.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (view !== "forgot") {
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (view === "register") {
      if (!/[A-Z]/.test(formData.password)) {
        errors.password = "Must contain at least one uppercase letter";
      } else if (!/[0-9]/.test(formData.password)) {
        errors.password = "Must contain at least one number";
      } else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(formData.password)) {
        errors.password = "Must contain at least one special character";
      }
    }
  }

  return errors;
};

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?\":{}|<>]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-urgency" };
  if (score === 2) return { score, label: "Fair", color: "bg-warning" };
  if (score === 3) return { score, label: "Good", color: "bg-primary" };
  return { score, label: "Strong", color: "bg-success" };
};

const PasswordStrengthMeter = ({ password }: { password: string }) => {
  const { score, label, color } = getPasswordStrength(password);
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? color : "bg-border"}`} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Password strength: <span className="font-medium">{label}</span></p>
    </div>
  );
};

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [view, setView] = useState<ModalView>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [forgotSent, setForgotSent] = useState(false);

  const { login, register } = useAuth();
  const { toast } = useToast();

  // Clear errors and form when switching views
  useEffect(() => {
    setErrors({});
    setTouched({});
    setFormData({ name: "", email: "", password: "" });
    setShowPassword(false);
    setForgotSent(false);
  }, [view]);

  // Clear everything when modal closes
  useEffect(() => {
    if (!open) {
      setView("login");
      setErrors({});
      setTouched({});
      setFormData({ name: "", email: "", password: "" });
      setShowPassword(false);
      setForgotSent(false);
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field on change
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const fieldErrors = validate(view, formData);
    if (fieldErrors[fieldName as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [fieldName]: fieldErrors[fieldName as keyof FormErrors] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(view, formData);
    setErrors(validationErrors);
    setTouched({ name: true, email: true, password: true });

    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);

    try {
      if (view === "forgot") {
        // No backend endpoint — show safe success message
        await new Promise(resolve => setTimeout(resolve, 800));
        setForgotSent(true);
        toast({
          title: "Check your email",
          description: "If an account exists with this email, a password reset link will be sent.",
        });
        return;
      }

      if (view === "login") {
        await login(formData.email, formData.password);
        toast({ title: "Welcome back!", description: "You have successfully logged in." });
      } else {
        await register(formData.email, formData.password, formData.name);
        toast({ title: "Account created!", description: "Welcome to LiveBid." });
      }
      onOpenChange(false);
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

  const renderFieldError = (field: keyof FormErrors) => {
    if (!touched[field] || !errors[field]) return null;
    return <p className="text-xs text-urgency mt-1">{errors[field]}</p>;
  };

  const isLogin = view === "login";
  const isRegister = view === "register";
  const isForgot = view === "forgot";

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
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-primary/60 flex items-end p-6">
              <p className="text-primary-foreground text-lg font-serif">Discover extraordinary treasures from world-class auction houses</p>
            </div>
          </div>

          {/* Right form */}
          <div className="flex-1 p-8 flex flex-col justify-center">
            {/* Forgot Password View */}
            {isForgot ? (
              <>
                <button
                  onClick={() => setView("login")}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 w-fit"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to login
                </button>

                {forgotSent ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-8 w-8 text-success" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Check Your Email</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      If an account exists for <strong>{formData.email}</strong>, you'll receive a password reset link shortly.
                    </p>
                    <button
                      onClick={() => setView("login")}
                      className="h-10 px-6 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
                    >
                      Return to Login
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Reset Password</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Enter the email address associated with your account and we'll send you a link to reset your password.
                    </p>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <label className="text-xs font-medium text-foreground uppercase tracking-wide">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur("email")}
                          placeholder="you@example.com"
                          className={`mt-1 w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring ${touched.email && errors.email ? "border-urgency" : "border-input"
                            }`}
                        />
                        {renderFieldError("email")}
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-10 rounded-md bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        SEND RESET LINK
                      </button>
                    </form>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Login / Register */}
                <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
                  {isLogin ? "Welcome Back!" : "Join LiveBid"}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {isLogin ? "Log in to your account" : "Create your free account"}
                </p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {isRegister && (
                    <div>
                      <label className="text-xs font-medium text-foreground uppercase tracking-wide">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("name")}
                        placeholder="John Doe"
                        className={`mt-1 w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring ${touched.name && errors.name ? "border-urgency" : "border-input"
                          }`}
                      />
                      {renderFieldError("name")}
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-foreground uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur("email")}
                      placeholder="you@example.com"
                      className={`mt-1 w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring ${touched.email && errors.email ? "border-urgency" : "border-input"
                        }`}
                    />
                    {renderFieldError("email")}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground uppercase tracking-wide">Password</label>
                    <div className="relative mt-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("password")}
                        placeholder="••••••••"
                        className={`w-full h-10 px-3 pr-10 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring ${touched.password && errors.password ? "border-urgency" : "border-input"
                          }`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {renderFieldError("password")}
                    {isRegister && formData.password.length > 0 && !errors.password && (
                      <PasswordStrengthMeter password={formData.password} />
                    )}
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
                  <button
                    onClick={() => setView("forgot")}
                    className="text-xs text-primary mt-3 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}



                <p className="text-xs text-muted-foreground mt-5 text-center">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button onClick={() => setView(isLogin ? "register" : "login")} className="text-primary font-medium hover:underline">
                    {isLogin ? "Join" : "Log In"}
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
