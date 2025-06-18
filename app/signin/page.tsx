"use client";
import { SignInWithGitHub } from "@/app/signin/[components]/SignInWithGitHub";
import { SignInWithGoogle } from "@/app/signin/[components]/SignInWithGoogle";
import { Sparkles } from "lucide-react";
import Image from "next/image";

export default function SignInWithOAuth() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md">
              <Sparkles className="size-4 mt-1" />
            </div>
            openchat.one
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignInWithGitHub />
            <SignInWithGoogle />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="https://res.cloudinary.com/dcwsgwsfw/image/upload/v1750019919/openchat/chat-bg-noise_roaydw.svg"
          alt="OpenChat"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          width={100}
          height={100}
        />
      </div>
    </div>
  );
}
