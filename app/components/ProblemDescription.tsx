'use client';

export interface ProblemData {
    title: string;
    description: string;
    examples: Array<{
        input: string;
        output: string;
    }>;
}

interface ProblemDescriptionProps {
    problemId?: string;
    data?: ProblemData;
}

export const ProblemDescription = ({ problemId, data }: ProblemDescriptionProps) => {
    return (
        <div className="w-full h-full">
            {data ? (
                <div>
                    <h1>{data.title}</h1>
                    <p>{data.description}</p>
                </div>
            ) : (
                <p>Loading problem...</p>
            )}
        </div>
    );
};
