import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Play, BookOpen } from "lucide-react";

export default function Guidelines() {
    const navigate = useNavigate();

    return (
        <PageWrapper>
            <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-4 font-sans text-neutral-900 sm:p-8">
                <div className="max-w-2xl w-full space-y-8">

                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
                            Matrix Flow Assessment
                        </h1>
                        <p className="text-xl text-neutral-500">
                            Gamified Technical Assessment Preview
                        </p>
                    </div>

                    {/* Disclaimer Card */}
                    <div className="rounded-2xl bg-amber-50 p-6 border-2 border-amber-100 shadow-sm">
                        <div className="flex items-start gap-4">
                            <ShieldAlert className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                            <div className="space-y-2">
                                <h3 className="font-bold text-amber-900">Beta Preview Disclaimer</h3>
                                <p className="text-amber-800 text-sm leading-relaxed">
                                    This is an application built to experience the gamified assessment beforehand.
                                    It might have some mistakes; please consider it only for the experience and
                                    report any problems. We will clear them ASAP.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Guidelines Card */}
                    <div className="rounded-2xl bg-white p-8 shadow-xl shadow-neutral-200/50 space-y-6">
                        <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-neutral-900">Game Guidelines</h2>
                        </div>

                        <div className="space-y-4 text-neutral-600">
                            <p>
                                Welcome to the Matrix Flow Puzzle! Your objective is to create a continuous path
                                connecting the <span className="font-bold text-neutral-900">Start (S)</span> point
                                to the <span className="font-bold text-neutral-900">End (E)</span> point.
                            </p>

                            <ul className="space-y-3 list-disc list-inside">
                                <li>
                                    <span className="font-bold text-neutral-900">Rotate:</span> Click a tile and use the Rotate button to change its orientation.
                                </li>
                                <li>
                                    <span className="font-bold text-neutral-900">Flip:</span> Use this flip button to change the direciton of the arrows
                                </li>
                                <li>
                                    <span className="font-bold text-neutral-900">Validate:</span> Once you think you have a solution, click the Check button to verify.
                                </li>
                            </ul>

                            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mt-4">
                                <strong>Challenge:</strong> You will face 3 consecutive levels of increasing complexity.
                                Complete them all to finish the assessment!
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={() => navigate("/game/matrix/play")}
                                className="w-full h-14 text-lg font-bold bg-neutral-900 hover:bg-neutral-800 text-white shadow-lg hover:shadow-xl transition-all"
                            >
                                <Play className="mr-2 h-5 w-5" />
                                Start Assessment
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </PageWrapper>
    );
}
