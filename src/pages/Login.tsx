import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { setSession, type UserType, type SidbiRole } from "@/lib/authStore";
import { useLoginMutation, useLoginAsDemoMutation } from "@/store/api";
import PublicLayout from "@/components/layout/PublicLayout";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(250, "Max 250 characters"),
  password: z.string().min(1, "Password is required").max(250, "Max 250 characters")
});

type LoginFormValues = z.infer<typeof loginSchema>;

const demoAccounts: {label: string;userType: UserType;email: string;sidbiRole?: SidbiRole;}[] = [
  { label: "Applicant Demo", userType: "applicant", email: "applicant@demo.com" },
  { label: "SIDBI Maker Demo", userType: "sidbi", email: "sidbi-maker@demo.com", sidbiRole: "maker" },
  { label: "SIDBI Checker Demo", userType: "sidbi", email: "sidbi-checker@demo.com", sidbiRole: "checker" },
  { label: "SIDBI Convenor Demo", userType: "sidbi", email: "sidbi-convenor@demo.com", sidbiRole: "convenor" },
  { label: "SIDBI Committee Member", userType: "sidbi", email: "sidbi-committee@demo.com", sidbiRole: "committee_member" },
  { label: "SIDBI Approving Authority", userType: "sidbi", email: "sidbi-approving@demo.com", sidbiRole: "approving_authority" },
  { label: "Admin Demo", userType: "admin", email: "admin@demo.com" },
];

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [loginAsDemo, { isLoading: isDemoLoading }] = useLoginAsDemoMutation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      const session = await login({ email: data.email, password: data.password }).unwrap();
      setSession(session);
      switch (session.userType) {
        case "applicant": navigate("/applicant/dashboard"); break;
        case "sidbi": navigate("/sidbi/dashboard"); break;
        case "admin": navigate("/admin/registrations"); break;
      }
    } catch {
      form.setError("email", { message: "Invalid email or password" });
    }
  }

  const handleDemoLogin = async (account: (typeof demoAccounts)[number]) => {
    try {
      const session = await loginAsDemo({
        email: account.email,
        userType: account.userType,
        sidbiRole: account.sidbiRole,
      }).unwrap();
      setSession(session);
      switch (account.userType) {
        case "applicant": navigate("/applicant/dashboard"); break;
        case "sidbi": navigate("/sidbi/dashboard"); break;
        case "admin": navigate("/admin/registrations"); break;
      }
    } catch {}
  };

  return (
    <PublicLayout subtitle="Venture Debt & Incubator Fund Platform" backTo="/" backLabel="Home">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground uppercase tracking-wide">Sign In</h1>
            <p className="text-sm text-muted-foreground mt-1">Access your Venture Debt application portal</p>
          </div>

          <div className="bg-card border border-border p-8 space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="email" render={({ field }) =>
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold text-sm uppercase tracking-wide">Email ID <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="you@company.com" className="h-11 border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                } />

                <FormField control={form.control} name="password" render={({ field }) =>
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold text-sm uppercase tracking-wide">Password <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" className="h-11 border-border" {...field} />
                        <Button type="button" variant="ghost" size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                } />

                <Button type="submit" size="lg" className="w-full h-11 font-bold uppercase tracking-wider" disabled={isLoginLoading}>
                  {isLoginLoading ? "Signing In…" : "Sign In"}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground uppercase tracking-wide">
                Demo Accounts
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) =>
                <Button key={acc.email} variant="outline" size="sm"
                  className="h-auto py-2 px-3 text-xs whitespace-normal text-center leading-snug border-border hover:border-secondary hover:text-secondary"
                  onClick={() => handleDemoLogin(acc)}
                  disabled={isDemoLoading}>
                  {acc.label}
                </Button>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">Register</Link>
          </p>
        </div>
      </main>
    </PublicLayout>
  );
};

export default Login;
