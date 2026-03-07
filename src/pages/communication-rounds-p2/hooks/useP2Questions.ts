import { useState, useEffect } from 'react';
import { CommunicationBackendService } from '@/communication/service/CommunicationService';
import type { Question, SectionType } from '@/communication/data/types';

const service = new CommunicationBackendService();

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Fetches all questions for a P2 section from DynamoDB,
 * randomly shuffles them, and returns `count` questions.
 * Every session the user sees a different random subset.
 */
export function useP2Questions(section: SectionType, count: number) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        service.getQuestionsForSection(section)
            .then(all => {
                if (cancelled) return;
                if (all.length === 0) {
                    setError('No questions found for this section.');
                    return;
                }
                setQuestions(shuffle(all).slice(0, count));
            })
            .catch(() => {
                if (!cancelled) setError('Failed to load questions. Please check your connection.');
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => { cancelled = true; };
    }, [section, count]);

    return { questions, isLoading, error };
}
