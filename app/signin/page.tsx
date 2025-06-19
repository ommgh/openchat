"use client";
import { SignInWithGitHub } from "@/app/signin/[components]/SignInWithGitHub";
import { SignInWithGoogle } from "@/app/signin/[components]/SignInWithGoogle";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SignInWithOAuth() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 text-[#b5fbfb] bg-[#040d28]">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-[#040d28] z-10 relative">
        <div className="flex justify-start gap-4 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex size-6 items-center justify-center rounded-md">
              <Sparkles className="size-4" />
            </div>
            openchat.one
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4 w-full">
            <SignInWithGitHub />
            <SignInWithGoogle />
          </div>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <Image
          src="https://res.cloudinary.com/dcwsgwsfw/image/upload/v1750370560/openchat/ChatGPT_Image_Jun_20_2025_03_31_51_AM_eux8xb.png"
          alt="OpenChat Portal"
          className="absolute inset-0 h-full w-full object-cover rounded-l-2xl"
          fill
        />
        <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#040d28] to-transparent pointer-events-none rounded-l-2xl" />
      </div>
    </div>
  );
}
