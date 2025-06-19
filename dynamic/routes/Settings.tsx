"use client";
import APIKeyForm from "@/components/dynamic/APIKeyForm";
import { Link, useSearchParams } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

export default function Settings() {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("from");

  return (
    <div>
      <section className="flex w-full h-full">
        <Link
          to={{
            pathname: `/chat${chatId ? `/${chatId}` : ""}`,
          }}
          className={buttonVariants({
            variant: "default",
            className: "w-fit fixed top-10 left-40 z-10",
          })}
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Chat
        </Link>
        <div className="flex items-center justify-center w-full h-full pt-24 pb-44 mx-auto">
          <APIKeyForm />
        </div>
      </section>
      <SignOutButton />
    </div>
  );
}
function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  return (
    <>
      {isAuthenticated && (
        <button
          className="bg-slate-200 dark:bg-slate-800 text-foreground rounded-md px-2 py-1"
          onClick={() =>
            void signOut().then(() => {
              router.push("/signin");
            })
          }
        >
          Sign out
        </button>
      )}
    </>
  );
}
