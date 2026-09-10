
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Practice.css';

const questionBank = {
  addition: {
    easy: [
      {
        question: 'What is 7 + 5?',
        options: ['10', '11', '12', '13'],
        answer: '12',
      },
      {
        question: 'What is 9 + 6?',
        options: ['14', '15', '16', '17'],
        answer: '15',
      },
      {
        question: 'What is 13 + 4?',
        options: ['16', '17', '18', '19'],
        answer: '17',
      },
    ],

    medium: [
      {
        question: 'What is 27 + 38?',
        options: ['55', '65', '75', '85'],
        answer: '65',
      },
      {
        question: 'What is 46 + 29?',
        options: ['65', '75', '85', '95'],
        answer: '75',
      },
      {
        question: 'What is 125 + 76?',
        options: ['191', '201', '211', '221'],
        answer: '201',
      },
    ],

    hard: [
      {
        question: 'What is 347 + 586?',
        options: ['823', '933', '943', '953'],
        answer: '933',
      },
      {
        question: 'What is 728 + 495?',
        options: ['1123', '1223', '1323', '1423'],
        answer: '1223',
      },
    ],
  },

  multiplication: {
    easy: [
      {
        question: 'What is 3 × 4?',
        options: ['10', '12', '14', '16'],
        answer: '12',
      },
      {
        question: 'What is 5 × 6?',
        options: ['25', '30', '35', '40'],
        answer: '30',
      },
      {
        question: 'What is 7 × 3?',
        options: ['18', '21', '24', '27'],
        answer: '21',
      },
    ],

    medium: [
      {
        question: 'What is 12 × 8?',
        options: ['86', '96', '106', '116'],
        answer: '96',
      },
      {
        question: 'What is 15 × 7?',
        options: ['95', '105', '115', '125'],
        answer: '105',
      },
      {
        question: 'What is 24 × 6?',
        options: ['124', '134', '144', '154'],
        answer: '144',
      },
    ],

    hard: [
      {
        question: 'What is 37 × 14?',
        options: ['488', '518', '528', '548'],
        answer: '518',
      },
      {
        question: 'What is 125 × 16?',
        options: ['1800', '2000', '2200', '2400'],
        answer: '2000',
      },
    ],
  },

  fractions: {
    easy: [
      {
        question: 'What is 1/2 + 1/2?',
        options: ['1/2', '1', '2', '3/2'],
        answer: '1',
      },
      {
        question: 'Which fraction is equal to 1/2?',
        options: ['1/3', '2/4', '3/4', '4/5'],
        answer: '2/4',
      },
      {
        question: 'What is 1/4 + 1/4?',
        options: ['1/4', '1/2', '3/4', '1'],
        answer: '1/2',
      },
    ],

    medium: [
      {
        question: 'What is 1/3 + 1/3?',
        options: ['1/3', '2/3', '3/3', '4/3'],
        answer: '2/3',
      },
      {
        question: 'What is 3/4 − 1/4?',
        options: ['1/4', '1/2', '2/3', '3/4'],
        answer: '1/2',
      },
    ],

    hard: [
      {
        question: 'What is 2/3 + 1/6?',
        options: ['3/6', '4/6', '5/6', '6/6'],
        answer: '5/6',
      },
      {
        question: 'What is 5/6 − 1/3?',
        options: ['1/3', '1/2', '2/3', '5/9'],
        answer: '1/2',
      },
    ],
  },

  algebra: {
    easy: [
      {
        question: 'If x + 3 = 7, what is x?',
        options: ['2', '3', '4', '5'],
        answer: '4',
      },
      {
        question: 'If x − 2 = 5, what is x?',
        options: ['5', '6', '7', '8'],
        answer: '7',
      },
    ],

    medium: [
      {
        question: 'If 2x = 14, what is x?',
        options: ['5', '6', '7', '8'],
        answer: '7',
      },
      {
        question: 'If x + 12 = 25, what is x?',
        options: ['11', '12', '13', '14'],
        answer: '13',
      },
    ],

    hard: [
      {
        question: 'If 3x + 6 = 21, what is x?',
        options: ['3', '4', '5', '6'],
        answer: '5',
      },
      {
        question: 'If 5x − 10 = 25, what is x?',
        options: ['5', '6', '7', '8'],
        answer: '7',
      },
    ],
  },

  geometry: {
    easy: [
      {
        question: 'How many sides does a triangle have?',
        options: ['2', '3', '4', '5'],
        answer: '3',
      },
      {
        question: 'How many sides does a square have?',
        options: ['3', '4', '5', '6'],
        answer: '4',
      },
    ],

    medium: [
      {
        question: 'What is the perimeter of a square with side 5?',
        options: ['10', '15', '20', '25'],
        answer: '20',
      },
      {
        question: 'What is the area of a rectangle 6 × 4?',
        options: ['10', '20', '24', '30'],
        answer: '24',
      },
    ],

    hard: [
      {
        question: 'What is the area of a triangle with base 10 and height 6?',
        options: ['20', '30', '40', '60'],
        answer: '30',
      },
      {
        question: 'A rectangle has length 12 and width 5. What is its perimeter?',
        options: ['24', '30', '34', '60'],
        answer: '34',
      },
    ],
  },
};

const categoryNames = {
  addition: 'Addition & Subtraction',
  multiplication: 'Multiplication & Division',
  fractions: 'Fractions',
  algebra: 'Algebra',
  geometry: 'Geometry',
};

const difficultyNames = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const getRandomQuestion = (category, difficulty) => {
  const questions = questionBank[category][difficulty];

  return questions[
    Math.floor(Math.random() * questions.length)
  ];
};

const Practice = () => {
  const [category, setCategory] = useState('addition');
  const [difficulty, setDifficulty] = useState('easy');

  const [started, setStarted] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState(null);

  const [userAnswer, setUserAnswer] = useState('');

  const [score, setScore] = useState(
    parseInt(localStorage.getItem('score')) || 0
  );

  const [feedback, setFeedback] = useState('');

  const [answered, setAnswered] = useState(false);

  const [saving, setSaving] = useState(false);

  // START PRACTICE
  const startPractice = () => {
    setCurrentQuestion(
      getRandomQuestion(category, difficulty)
    );

    setStarted(true);
    setUserAnswer('');
    setFeedback('');
    setAnswered(false);
  };

  // CHECK ANSWER
  const handleCheckAnswer = async () => {
    if (answered) {
      return;
    }

    if (!userAnswer) {
      return;
    }

    const isCorrect =
      userAnswer === currentQuestion.answer;

    setAnswered(true);
    setSaving(true);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5001/api/progress/answer',
        {
          correct: isCorrect,
          category: category,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedProgress =
        response.data.progress;

      // Update total score
      setScore(
        updatedProgress.correctAnswers
      );

      localStorage.setItem(
        'score',
        updatedProgress.correctAnswers
      );

      localStorage.setItem(
        'questionsAnswered',
        updatedProgress.questionsAnswered
      );

      // Feedback
      if (isCorrect) {
        setFeedback('correct');
      } else {
        setFeedback('wrong');
      }

    } catch (error) {
      console.error(
        'PROGRESS UPDATE ERROR:',
        error
      );

      setFeedback('error');

    } finally {
      setSaving(false);
    }
  };

  // NEXT QUESTION
  const handleNextQuestion = () => {
    setCurrentQuestion(
      getRandomQuestion(
        category,
        difficulty
      )
    );

    setUserAnswer('');
    setFeedback('');
    setAnswered(false);
  };

  return (
    <div className="practice-page">

      {/* HEADER */}
      <header className="practice-header">

        <div className="practice-nav">

          <Link
            to="/dashboard"
            className="practice-logo"
          >
            Geonix
          </Link>

          <nav className="practice-links">

            <Link to="/dashboard">
              Dashboard
            </Link>

            <Link
              to="/practice"
              className="active"
            >
              Practice
            </Link>

            <Link to="/score">
              Progress
            </Link>

            <Link to="/profile">
              Profile
            </Link>

          </nav>

        </div>

      </header>

      {/* MAIN */}
      <main className="practice-main">

        {/* SELECT CATEGORY + DIFFICULTY */}
        {!started ? (
          <>

            <section className="practice-intro">

              <p className="practice-small">
                Choose your challenge 🎯
              </p>

              <h1>
                Math Practice 🧮
              </h1>

              <p>
                Choose a topic and difficulty level
                before you start practicing.
              </p>

            </section>

            <section className="practice-selection-card">

              {/* CATEGORY */}
              <div className="selection-group">

                <h2>
                  Choose a category
                </h2>

                <div className="selection-options">

                  {Object.entries(categoryNames).map(
                    ([value, name]) => (
                      <button
                        key={value}
                        type="button"
                        className={`selection-option ${
                          category === value
                            ? 'selected'
                            : ''
                        }`}
                        onClick={() =>
                          setCategory(value)
                        }
                      >
                        {name}
                      </button>
                    )
                  )}

                </div>

              </div>

              {/* DIFFICULTY */}
              <div className="selection-group">

                <h2>
                  Choose difficulty
                </h2>

                <div className="difficulty-options">

                  {Object.entries(
                    difficultyNames
                  ).map(([value, name]) => (
                    <button
                      key={value}
                      type="button"
                      className={`difficulty-option difficulty-${value} ${
                        difficulty === value
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() =>
                        setDifficulty(value)
                      }
                    >
                      {name}
                    </button>
                  ))}

                </div>

              </div>

              {/* START */}
              <button
                type="button"
                className="start-practice-button"
                onClick={startPractice}
              >
                Start Practice →
              </button>

            </section>

          </>
        ) : (
          <>
            {/* PRACTICE INTRO */}
            <section className="practice-intro">

              <p className="practice-small">
                {categoryNames[category]} •{' '}
                {difficultyNames[difficulty]}
              </p>

              <h1>
                Math Practice 🧮
              </h1>

              <p>
                Solve the question and keep improving.
              </p>

            </section>

            {/* SCORE + CHANGE TOPIC */}
            <div className="practice-top-row">

              <div className="practice-score">
                Score:{' '}
                <strong>
                  {score}
                </strong>
              </div>

              <button
                type="button"
                className="change-practice-button"
                onClick={() =>
                  setStarted(false)
                }
              >
                Change Topic
              </button>

            </div>

            {/* QUESTION */}
            <section className="question-card">

              <p className="question-number">
                {categoryNames[category]} •{' '}
                {difficultyNames[difficulty]}
              </p>

              <h2>
                {currentQuestion.question}
              </h2>

              {/* ANSWERS */}
              <div className="answer-section">

                <label>
                  Choose your answer
                </label>

                <div className="answer-options">

                  {currentQuestion.options.map(
                    (option) => (
                      <button
                        key={option}
                        type="button"
                        className={`answer-option ${
                          userAnswer === option
                            ? 'selected'
                            : ''
                        }`}
                        onClick={() =>
                          setUserAnswer(option)
                        }
                        disabled={answered}
                      >
                        {option}
                      </button>
                    )
                  )}

                </div>

              </div>

              {/* CHECK */}
              {!answered && (
                <button
                  type="button"
                  className="check-button"
                  onClick={handleCheckAnswer}
                  disabled={
                    !userAnswer || saving
                  }
                >
                  {saving
                    ? 'Saving...'
                    : 'Check Answer'}
                </button>
              )}

              {/* CORRECT */}
              {feedback === 'correct' && (
                <div className="feedback correct-feedback">
                  ✓ Correct! Great job!
                </div>
              )}

              {/* WRONG */}
              {feedback === 'wrong' && (
                <div className="feedback wrong-feedback">

                  ✕ Not quite.

                  <br />

                  The correct answer is{' '}

                  <strong>
                    {currentQuestion.answer}
                  </strong>.

                </div>
              )}

              {/* ERROR */}
              {feedback === 'error' && (
                <div className="feedback wrong-feedback">

                  ✕ Could not save your progress.
                  Please try again.

                </div>
              )}

              {/* NEXT */}
              {answered &&
                feedback !== 'error' && (
                  <button
                    type="button"
                    className="next-button"
                    onClick={handleNextQuestion}
                  >
                    Next Question →
                  </button>
                )}

            </section>

            {/* BACK */}
            <Link
              to="/dashboard"
              className="back-dashboard"
            >
              ← Back to Dashboard
            </Link>

          </>
        )}

      </main>

    </div>
  );
};

export default Practice;