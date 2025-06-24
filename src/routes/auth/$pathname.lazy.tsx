import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { Link, createLazyFileRoute } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

export const Route = createLazyFileRoute("/auth/$pathname")({
    component: RouteComponent
})

function RouteComponent() {

    return (
        <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
            <div className="hidden bg-[url('https://res.cloudinary.com/dcwsgwsfw/image/upload/v1750355578/openchat/openportal.png')] bg-center bg-cover bg-no-repeat lg:block" />
            <div className="relative flex flex-col items-center justify-center gap-4 p-4 sm:p-6 md:p-8">
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                    <Link to="/">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back</span>
                        </Button>
                    </Link>
                </div>
                <div className="flex w-full max-w-sm items-center justify-center gap-4 sm:max-w-md lg:max-w-lg">
                    <AuthCard />
                </div>
            </div>
        </main>
    )
}
