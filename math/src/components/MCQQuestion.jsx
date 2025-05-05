import { useState } from 'react';

export default function MCQQuestion({ question, options, correctIndex, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleSelect = (index) => {
    setSelected(index);
    setShowAnswer(true);
    if (onAnswer) onAnswer(index === correctIndex);
  };

  return (
    <div className="p-4 bg-white shadow rounded-xl mb-4">
      <h3 className="text-lg font-semibold mb-3">{question}</h3>
      <ul className="space-y-2">
        {options.map((opt, i) => (
          <li key={i}>
            <button
              onClick={() => handleSelect(i)}
              className={`w-full text-left px-4 py-2 rounded border ${
                showAnswer
                  ? i === correctIndex
                    ? 'bg-green-100 border-green-600'
                    : i === selected
                    ? 'bg-red-100 border-red-600'
                    : 'bg-white'
                  : 'hover:bg-blue-50'
              }`}
              disabled={showAnswer}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
      {showAnswer && (
        <p className="mt-3 text-sm text-gray-600">
          {selected === correctIndex ? '✅ Correct!' : '❌ Incorrect. Try again later!'}
        </p>
      )}
    </div>
  );
}
