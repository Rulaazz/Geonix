import React from 'react';

const Score = () => {
  // Dummy score data — replace with real data from your app logic later
  const score = 8;
  const total = 10;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Your Score Summary</h1>
      <p className="text-lg mb-2">You answered <strong>{score}</strong> out of <strong>{total}</strong> questions correctly.</p>
      <div className="bg-green-100 p-4 rounded mt-4">
        <p>Great job! Keep practicing to improve even more. 🎯</p>
      </div>
    </div>
  );
};

export default Score;
