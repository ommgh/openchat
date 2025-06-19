import { useAuthActions } from "@convex-dev/auth/react";
import { GoogleLogo } from "@/components/logo/GoogleLogo";
import { Button } from "@/components/ui/button";

export function SignInWithGoogle() {
  const { signIn } = useAuthActions();
  return (
    <Button
      variant="outline"
      type="button"
      onClick={() => void signIn("google")}
      className="max-w-3xl w-full"
    >
      <GoogleLogo className="mr-2 h-4 w-4" /> Continue With Google
    </Button>
  );
}
