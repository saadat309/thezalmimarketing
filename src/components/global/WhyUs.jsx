import { Card } from "@/components/ui/card";
import { FaHandshake, FaShieldAlt, FaChartLine } from "react-icons/fa";

export default function WhyUs(){
    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Why Trust Us?</h2>
            <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
                We are committed to providing you with the best service possible.
            </p>
            <div className="grid grid-cols-1 gap-8 mt-12 sm:grid-cols-3">
                <div className="relative overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 to-sky-600/10" />
                    <Card className="relative z-10 p-8 border-0 shadow-none">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="p-4 rounded-full bg-emerald-50 text-emerald-600">
                                <FaHandshake size={28} />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold">Expert Knowledge</h4>
                                <p className="mt-1 text-muted-foreground">
                                    Deep, data-driven insight into DHA & premium markets.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="relative overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/10 to-rose-400/10" />
                    <Card className="relative z-10 p-8 border-0 shadow-none">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="p-4 text-yellow-600 rounded-full bg-yellow-50">
                                <FaShieldAlt size={28} />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold">Transparency</h4>
                                <p className="mt-1 text-muted-foreground">
                                    Clear pricing, full documentation, and honest advice.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="relative overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400/10 to-sky-500/10" />
                    <Card className="relative z-10 p-8 border-0 shadow-none">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="p-4 text-indigo-600 rounded-full bg-indigo-50">
                                <FaChartLine size={28} />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold">Client-Centric</h4>
                                <p className="mt-1 text-muted-foreground">
                                    Tailored strategies aligned to your financial goals.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}