import { useAuthActions } from "@convex-dev/auth/react";
import { GitHubLogo } from "@/components/logo/GitHubLogo";
import { Button } from "@/components/ui/button";

export function SignInWithGitHub() {
  const { signIn } = useAuthActions();
  return (
    <Button
      variant="outline"
      type="button"
      onClick={() => void signIn("github")}
      className="max-w-3xl w-full"
    >
      <GitHubLogo className="mr-2 h-4 w-4" /> Continue With Github
    </Button>
  );
}
