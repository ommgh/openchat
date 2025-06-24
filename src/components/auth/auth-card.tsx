"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { toast } from "sonner"
import { GithubIcon, GoogleIcon } from "../brand-icons"

export function AuthCard() {

    const socialSignInMutation = useMutation({
        mutationFn: async (provider: "google" | "github") => {
            return await authClient.signIn.social({
                provider
            })
        },
        onError: (error) => {
            toast.error(error.message ?? `Failed to sign in with ${error}`)
        }
    })


    return (
        <MotionConfig
            transition={{
                type: "tween",
                duration: 0.15,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
        >
            <div className="flex w-full max-w-sm flex-col gap-6 md:max-w-md">
                <div className="gap-4 overflow-hidden pt-3 pb-5">
                    

                    <div className="relative overflow-hidden">
                        <AnimatePresence mode="wait">
                           
                                <motion.div
                                    key="email-step"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                >
                                    <div className="grid gap-6">
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col gap-2"
                                        >
                                            <Button
                                                variant="outline"
                                                className="h-10 w-full gap-2"
                                                onClick={() =>
                                                    socialSignInMutation.mutate("google")
                                                }
                                                disabled={socialSignInMutation.isPending}
                                            >
                                                {socialSignInMutation.isPending ? (
                                                    <Loader2 className="size-4 shrink-0 animate-spin" />
                                                ) : (
                                                    <GoogleIcon className="size-4 shrink-0" />
                                                )}
                                                Continue with Google
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="h-10 w-full gap-2"
                                                onClick={() =>
                                                    socialSignInMutation.mutate("github")
                                                }
                                                disabled={socialSignInMutation.isPending}
                                            >
                                                {socialSignInMutation.isPending ? (
                                                    <Loader2 className="size-4 shrink-0 animate-spin" />
                                                ) : (
                                                    <GithubIcon className="size-5 shrink-0" />
                                                )}
                                                Continue with GitHub
                                            </Button>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </MotionConfig>
    )
}
