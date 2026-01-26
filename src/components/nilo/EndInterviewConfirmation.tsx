import React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface EndInterviewConfirmationProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isEnding: boolean;
}

export const EndInterviewConfirmation = ({
    isOpen,
    onConfirm,
    onCancel,
    isEnding
}: EndInterviewConfirmationProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isEnding && onCancel()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-indigo-600" />
                    </div>
                    <DialogTitle className="text-center text-xl">Finish Interview?</DialogTitle>
                    <DialogDescription className="text-center">
                        Are you sure you want to end your interview now? We will analyze your responses and generate your detailed performance report.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-slate-50 p-4 rounded-xl space-y-3 my-2">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                        <p className="text-sm text-slate-600 font-medium">Your answers will be submitted for AI analysis.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                        <p className="text-sm text-slate-600 font-medium">A comprehensive feedback report will be generated.</p>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-center pt-2">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isEnding}
                        className="rounded-xl font-bold h-12"
                    >
                        Continue Interview
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isEnding}
                        className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold h-12 px-8 shadow-lg shadow-indigo-100"
                    >
                        {isEnding ? "Submitting..." : "Submit & Get Feedback"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
