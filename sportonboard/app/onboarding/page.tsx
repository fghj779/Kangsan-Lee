'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type QuizQuestion = {
  id: string;
  type: string;
  question: string;
  description: string;
  options: Array<{ id: string; label: string; value: string }>;
  required: boolean;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Create session
    fetch('/api/users/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserId(data.data.userId);
          localStorage.setItem('sessionId', data.data.sessionId);
        }
      });

    // Fetch questions
    fetch('/api/quiz/questions')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQuestions(data.data);
        }
        setLoading(false);
      });
  }, []);

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;

  const handleAnswer = (value: any) => {
    setResponses({ ...responses, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!userId) return;

    setSubmitting(true);

    const formattedResponses = Object.entries(responses).map(([questionId, answers]) => ({
      questionId,
      answers,
    }));

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, responses: formattedResponses }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/recommendations');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading quiz...</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="min-h-screen flex items-center justify-center">No questions available</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Question {currentStep + 1} of {questions.length}
            </span>
            <span>{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-2">{currentQuestion.question}</h2>
          <p className="text-gray-600 mb-6">{currentQuestion.description}</p>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.type === 'multi_select' ? (
              currentQuestion.options.map((option) => {
                const selected = (responses[currentQuestion.id] || []).includes(option.value);
                return (
                  <label
                    key={option.id}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                      selected ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mr-3"
                      checked={selected}
                      onChange={(e) => {
                        const current = responses[currentQuestion.id] || [];
                        const updated = e.target.checked
                          ? [...current, option.value]
                          : current.filter((v: string) => v !== option.value);
                        handleAnswer(updated);
                      }}
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                );
              })
            ) : (
              currentQuestion.options.map((option) => {
                const selected = responses[currentQuestion.id] === option.value;
                return (
                  <label
                    key={option.id}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                      selected ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      className="mr-3"
                      checked={selected}
                      onChange={() => handleAnswer(option.value)}
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!responses[currentQuestion.id] || submitting}
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? 'Submitting...' : isLastQuestion ? 'Get Recommendations' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
