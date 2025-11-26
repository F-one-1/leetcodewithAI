import { useState, useEffect } from 'react';
import axios from 'axios';
import type { TestCase } from '@/types';

export function useTestCases(problemId: string) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState('');
  const [loading, setLoading] = useState(false);

  // 加载测试用例数据
  useEffect(() => {
    const loadTestCases = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/problems/${problemId}`);
        const problemData = response.data;

        if (problemData.testCases && problemData.testCases.length > 0) {
          // 将 JSON 格式转换为 TestCase 格式
          const formattedTestCases: TestCase[] = problemData.testCases.map((tc: any) => ({
            id: tc.id,
            input: Array.isArray(tc.input) ? JSON.stringify(tc.input) : String(tc.input),
            expectedOutput: String(tc.expectedOutput),
          }));

          setTestCases(formattedTestCases);
          if (formattedTestCases.length > 0) {
            setSelectedTestCaseId(formattedTestCases[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load test cases:', error);
        // 如果加载失败，使用默认测试用例
        const defaultTestCase: TestCase = {
          id: '1',
          input: '',
          expectedOutput: '',
        };
        setTestCases([defaultTestCase]);
        setSelectedTestCaseId('1');
      } finally {
        setLoading(false);
      }
    };

    loadTestCases();
  }, [problemId]);

  const addTestCase = () => {
    const newId = String(Date.now());
    const newTestCase: TestCase = {
      id: newId,
      input: '',
      expectedOutput: '',
    };
    setTestCases([...testCases, newTestCase]);
    setSelectedTestCaseId(newId);
  };

  const deleteTestCase = (id: string) => {
    const filtered = testCases.filter((tc) => tc.id !== id);
    setTestCases(filtered);
    if (selectedTestCaseId === id && filtered.length > 0) {
      setSelectedTestCaseId(filtered[0].id);
    }
  };

  const updateTestCase = (id: string, field: 'input' | 'expectedOutput', value: string) => {
    setTestCases(testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)));
  };

  return {
    testCases,
    selectedTestCaseId,
    loading,
    setSelectedTestCaseId,
    addTestCase,
    deleteTestCase,
    updateTestCase,
  };
}

