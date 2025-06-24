import { Button } from "@/components/ui/button"
import { useNavigate } from "@tanstack/react-router"
import { motion } from "framer-motion"

export const SignupMessagePrompt = () => {
    const navigate = useNavigate()

    const handleNavigation = () => {
        navigate({ to: "/auth/$pathname", params: { pathname: "signup" }, replace: true })
    }
    

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="isolate mx-auto flex max-w-md flex-col items-center justify-center md:p-8"
        >
            <div className="z-2 mb-8 space-y-12 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                >
                  
                   
                   <h1 className="font-bold text-4xl tracking-tight">
                        Welcome to OpenChat
                   </h1>
                
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="flex w-full gap-3"
            >
                    <Button
                        onClick={handleNavigation}
                        className="min-w-88 font-medium transition-all hover:scale-102 active:scale-98"
                        size="lg"   
                    >
                        Let's Get Started
                    </Button>
            </motion.div>
        </motion.div>
    )
}
