'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export interface ProblemData {
    id: string;
    title: string;
    difficulty: string;
    content: string;
}

interface ProblemDescriptionProps {
    problemId?: string;
}

export const ProblemDescription = ({ problemId = '121-easy-Best-Time-to-Buy-and-Sell-Stock' }: ProblemDescriptionProps) => {
    const [problemData, setProblemData] = useState<ProblemData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProblemData = async () => {
            if (!problemId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await axios.get<ProblemData>(`/api/problems/${problemId}`);
                setProblemData(response.data);
            } catch (err) {
                console.error('Failed to load problem data:', err);
                setError('Failed to load problem data');
            } finally {
                setLoading(false);
            }
        };

        fetchProblemData();
    }, [problemId]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto px-6 py-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-[var(--text-secondary)]">Loading problem...</p>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-[var(--text-secondary)]">{error}</p>
                    </div>
                ) : problemData ? (
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-[var(--text-primary)] ">{problemData.title}</h3>
                                <span className={`px-2 py-1 text-xs rounded ${problemData.difficulty === 'Easy'
                                    ? 'bg-green-100 text-green-800'
                                    : problemData.difficulty === 'Medium'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {problemData.difficulty}
                                </span>
                            </div>
                        </div>
                        <div
                            className="text-[var(--text-secondary)] [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-[var(--text-primary)] [&_em]:italic [&_pre]:bg-[var(--layer-bg-gray)] [&_pre]:p-3 [&_pre]:rounded [&_pre]:border [&_pre]:border-[var(--border-quaternary)] [&_pre]:overflow-x-auto [&_pre]:text-sm [&_pre]:font-mono [&_pre]:whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: problemData.content }}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Problem Title</h3>
                            <p className="text-[var(--text-secondary)]">Add your problem description here</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Description</h3>
                            <p className="text-[var(--text-secondary)]">This is where the problem statement goes.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
