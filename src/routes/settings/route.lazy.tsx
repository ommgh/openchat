import { SettingsLayout } from "@/components/settings/settings-layout"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/convex/_generated/api"
import { useSession } from "@/hooks/auth-hooks"
import { cn } from "@/lib/utils"
import { useConvexQuery } from "@convex-dev/react-query"
import { Outlet, createLazyFileRoute, useLocation, useNavigate } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, Box, Key, Paperclip, Settings, User } from "lucide-react"
import { type ReactNode, useEffect } from "react"

interface SettingsLayoutProps {
    children?: ReactNode
    title?: string
    description?: string
}

const settingsNavItems = [
    {
        title: "Profile",
        href: "/settings/profile",
        icon: User
    },
    {
        title: "Providers",
        href: "/settings/providers",
        icon: Key
    },
    {
        title: "Models",
        href: "/settings/models",
        icon: Box
    },
    {
        title: "Customization",
        href: "/settings/customization",
        icon: Settings
    },
    {
        title: "Attachments",
        href: "/settings/attachments",
        icon: Paperclip
    }
]

export const Route = createLazyFileRoute("/settings")({
    component: SettingsPage
})

const Inner = () => {
    const session = useSession()
    const userSettings = useConvexQuery(
        api.settings.getUserSettings,
        session.user?.id ? {} : "skip"
    )
    if (!session.user?.id) {
        return (
            <SettingsLayout
                title="API Keys"
                description="Manage your models and providers. Keys are encrypted and stored securely."
            >
                <p className="text-muted-foreground text-sm">Sign in to manage your API keys.</p>
            </SettingsLayout>
        )
    }
    if (!userSettings) {
        return (
            <SettingsLayout
                title="API Keys"
                description="Manage your models and providers. Keys are encrypted and stored securely."
            >
                <Skeleton className="h-10 w-full" />
            </SettingsLayout>
        )
    }
    if ("error" in userSettings) {
        return (
            <SettingsLayout
                title="API Keys"
                description="Manage your models and providers. Keys are encrypted and stored securely."
            >
                <p className="text-muted-foreground text-sm">Error loading API keys.</p>
            </SettingsLayout>
        )
    }

    return <Outlet />
}

function SettingsPage({ title, description }: SettingsLayoutProps) {
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if (location.pathname === "/settings" || location.pathname === "/settings/") {
            navigate({
                to: "/settings/profile",
                replace: true
            })
        }
    }, [location.pathname, navigate])

    return (
        <div className="flex h-screen flex-col overflow-y-auto bg-background">
            <div className="container mx-auto flex max-w-6xl flex-1 flex-col p-3 pb-6 lg:max-h-dvh lg:overflow-y-hidden lg:p-6">
                {/* Header */}
                <div className="mb-8 max-md:px-2">
                    <div className="mb-6 flex items-center gap-4">
                        <Link to="/">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Chat
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-1">
                        <h1 className="font-semibold text-3xl tracking-tight">Settings</h1>
                    </div>
                </div>

                <div className="flex w-full flex-col space-y-6">
                    {/* Navigation */}
                    <div className="w-full overflow-x-auto pb-2">
                        <nav className="flex space-x-1">
                            {settingsNavItems.map((item) => {
                                const isActive = location.pathname === item.href
                                const Icon = item.icon

                                return (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        className={cn(
                                            "inline-flex min-w-fit items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 font-medium text-sm transition-colors",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                            isActive
                                                ? "bg-muted text-foreground"
                                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="hidden sm:inline">{item.title}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="w-full">
                        <div className="space-y-6 p-0.5 lg:max-h-[calc(100dvh-12rem)] lg:overflow-y-auto">
                            <Inner />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
