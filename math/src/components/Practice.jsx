import React, { useState, useEffect } from 'react';

const questions = [
  { question: 'What is 2 + 2?', answer: '4' },
  { question: 'What is 5 x 3?', answer: '15' },
  { question: 'What is 12 - 7?', answer: '5' },
  { question: 'What is 9 / 3?', answer: '3' },
  // Add more questions here
];

const getRandomQuestion = () => {
  return questions[Math.floor(Math.random() * questions.length)];
};

const Practice = () => {
  const [currentQuestion, setCurrentQuestion] = useState(getRandomQuestion);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(() => parseInt(localStorage.getItem('score')) || 0);
  const [feedback, setFeedback] = useState('');

  const handleCheckAnswer = () => {
    if (userAnswer.trim() === currentQuestion.answer) {
      const newScore = score + 1;
      setScore(newScore);
      localStorage.setItem('score', newScore);
      setFeedback('✅ Correct!');
    } else {
      setFeedback(`❌ Wrong! The correct answer is ${currentQuestion.answer}.`);
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestion(getRandomQuestion());
    setUserAnswer('');
    setFeedback('');
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Practice Mode</h2>
      <p className="text-lg mb-2">{currentQuestion.question}</p>
      <input
        type="text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        className="border p-2 rounded w-full mb-4"
        placeholder="Your answer..."
      />
      <div className="flex gap-2 mb-4">
        <button onClick={handleCheckAnswer} className="px-4 py-2 bg-blue-500 text-white rounded">
          Submit
        </button>
        <button onClick={handleNextQuestion} className="px-4 py-2 bg-gray-300 rounded">
          Next / Skip
        </button>
      </div>
      {feedback && <p className="mb-4">{feedback}</p>}
      <p className="text-right text-sm text-gray-600">Score: {score}</p>
    </div>
  );
};

export default Practice;
