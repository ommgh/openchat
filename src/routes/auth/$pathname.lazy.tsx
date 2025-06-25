import { AuthCard } from "@/components/auth/auth-card"
import { Link, createLazyFileRoute } from "@tanstack/react-router"
import { Sparkles } from "lucide-react"

export const Route = createLazyFileRoute("/auth/$pathname")({
    component: RouteComponent
})

function RouteComponent() {
    return (
        <div className="grid min-h-svh bg-[#040d28] text-white lg:grid-cols-2">
            <div className="relative z-10 flex flex-col gap-4 bg-[#040d28] p-6 md:p-10">
                <div className="flex justify-start gap-4 md:justify-start">
                    <Link to="/" className="flex items-center gap-2 font-semibold">
                        <div className="flex size-6 items-center justify-center rounded-md">
                            <Sparkles className="size-4" />
                        </div>
                        openchat.one
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="flex w-full max-w-sm flex-col items-center gap-4">
                        <AuthCard />
                    </div>
                </div>
            </div>

            <div className="relative hidden lg:block">
                <div 
                    className="absolute inset-0 h-full w-full bg-[url('https://res.cloudinary.com/dcwsgwsfw/image/upload/v1750370560/openchat/ChatGPT_Image_Jun_20_2025_03_31_51_AM_eux8xb.png')] bg-center bg-cover"
                />
                <div className="pointer-events-none absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-[#040d28] to-transparent" />
            </div>
        </div>
    )
}
