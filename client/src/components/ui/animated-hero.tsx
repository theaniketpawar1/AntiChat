import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

function Hero() {
    const [titleNumber, setTitleNumber] = useState(0);
    const titles = useMemo(
        () => ["intelligent", "powerful", "creative", "fast", "amazing"],
        []
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (titleNumber === titles.length - 1) {
                setTitleNumber(0);
            } else {
                setTitleNumber(titleNumber + 1);
            }
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [titleNumber, titles]);

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4">
                <div className="flex gap-8 py-20 lg:py-32 items-center justify-center flex-col">
                    <div className="flex gap-4 flex-col items-center">
                        <div className="flex items-center gap-2 mb-4">
                            <MessageSquare className="w-12 h-12 text-primary" />
                            <h2 className="text-3xl font-bold">AntiChat</h2>
                        </div>

                        <h1 className="text-5xl md:text-7xl max-w-3xl tracking-tighter text-center font-regular">
                            <span className="text-foreground">Chat with</span>
                            <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                                &nbsp;
                                {titles.map((title, index) => (
                                    <motion.span
                                        key={index}
                                        className="absolute font-semibold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent"
                                        initial={{ opacity: 0, y: "-100" }}
                                        transition={{ type: "spring", stiffness: 50 }}
                                        animate={
                                            titleNumber === index
                                                ? {
                                                    y: 0,
                                                    opacity: 1,
                                                }
                                                : {
                                                    y: titleNumber > index ? -150 : 150,
                                                    opacity: 0,
                                                }
                                        }
                                    >
                                        {title}
                                    </motion.span>
                                ))}
                            </span>
                            <span className="text-foreground">AI</span>
                        </h1>

                        <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center mt-4">
                            Experience the power of multiple AI models in one place. From free models to premium GPT-4,
                            choose the perfect AI assistant for your needs.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Button size="lg" className="gap-2 text-base">
                            <Sparkles className="w-5 h-5" />
                            Start Chatting
                        </Button>
                        <Button size="lg" variant="outline" className="gap-2 text-base">
                            <MessageSquare className="w-5 h-5" />
                            Learn More
                        </Button>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                        <div className="p-6 rounded-lg border bg-card text-card-foreground">
                            <h3 className="font-semibold text-lg mb-2">Multiple Models</h3>
                            <p className="text-sm text-muted-foreground">
                                Access Llama, Mistral, GPT-4, and more AI models
                            </p>
                        </div>
                        <div className="p-6 rounded-lg border bg-card text-card-foreground">
                            <h3 className="font-semibold text-lg mb-2">Free & Premium</h3>
                            <p className="text-sm text-muted-foreground">
                                Start with free models, upgrade when you need more power
                            </p>
                        </div>
                        <div className="p-6 rounded-lg border bg-card text-card-foreground">
                            <h3 className="font-semibold text-lg mb-2">Chat History</h3>
                            <p className="text-sm text-muted-foreground">
                                All your conversations saved and organized
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { Hero };
