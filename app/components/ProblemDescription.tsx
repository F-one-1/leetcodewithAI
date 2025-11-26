'use client';

import { useEffect, useState } from 'react';

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
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/problems/${problemId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load problem: ${response.statusText}`);
        }
        
        const data: ProblemData = await response.json();
        setProblemData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error loading problem data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblemData();
  }, [problemId]);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 px-6 py-4 border-b border-[var(--border-quaternary)] bg-white">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Problem Description</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[var(--text-secondary)]">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 px-6 py-4 border-b border-[var(--border-quaternary)] bg-white">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Problem Description</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!problemData) {
    return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 px-6 py-4 border-b border-[var(--border-quaternary)] bg-white">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Problem Description</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[var(--text-secondary)]">No problem data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-6 py-4 border-b border-[var(--border-quaternary)] bg-white">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Problem Description</h2>
      </div>
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="space-y-4">
          {/* Problem Title */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Problem Title</h3>
            <p className="text-[var(--text-secondary)]">{problemData.title}</p>
          </div>

          {/* Difficulty */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Difficulty</h3>
            <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
              problemData.difficulty === 'Easy'
                ? 'bg-green-100 text-green-800'
                : problemData.difficulty === 'Medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }`}>
              {problemData.difficulty}
            </span>
          </div>

          {/* Problem Content */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Description</h3>
            <div className="prose prose-sm max-w-none text-[var(--text-secondary)]">
              <div
                dangerouslySetInnerHTML={{ __html: problemData.content }}
                className="space-y-3"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

