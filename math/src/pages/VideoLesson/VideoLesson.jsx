import { API_BASE_URL } from '../../config/api';
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

import axios from 'axios';

import './VideoLesson.css';

import {
  lessons,
} from '../../components/VideoLesson/VideoLessons';

import lessonQuizzes from '../../data/lessonQuizzes';


/* =========================
   VIDEO LESSON PAGE
========================= */

const VideoLesson = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();


  /* =========================
     FIND CURRENT LESSON
  ========================= */

  const currentLessonIndex = useMemo(() => {
    return lessons.findIndex(
      (lesson) => lesson.id === lessonId
    );
  }, [lessonId]);


  const lesson =
    currentLessonIndex !== -1
      ? lessons[currentLessonIndex]
      : null;


  /* =========================
     PREVIOUS / NEXT
  ========================= */

  const previousLesson =
    currentLessonIndex > 0
      ? lessons[currentLessonIndex - 1]
      : null;


  const nextLesson =
    currentLessonIndex !== -1 &&
    currentLessonIndex < lessons.length - 1
      ? lessons[currentLessonIndex + 1]
      : null;


  /* =========================
     LESSON STATE
  ========================= */

  const [completed, setCompleted] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');


  /* =========================
     QUIZ STATE
  ========================= */

  const quiz =
    lesson
      ? lessonQuizzes[lesson.id] || []
      : [];

  const [quizStarted, setQuizStarted] =
    useState(false);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState(null);

  const [answers, setAnswers] =
    useState({});

  const [quizFinished, setQuizFinished] =
    useState(false);

  const [quizScore, setQuizScore] =
    useState(0);

  const [quizPercentage, setQuizPercentage] =
    useState(0);

  const [quizSaving, setQuizSaving] =
    useState(false);

  const [quizMessage, setQuizMessage] =
    useState('');

  const [quizError, setQuizError] =
    useState('');

  const [previousQuizResult, setPreviousQuizResult] =
    useState(null);

  const [quizResultLoading, setQuizResultLoading] =
    useState(false);


  /* =========================
     CURRENT QUESTION
  ========================= */

  const currentQuizQuestion =
    quiz[currentQuestion];


  /* =========================
     LOAD LESSON PROGRESS
  ========================= */

  useEffect(() => {
    const loadProgress = async () => {
      if (!lesson) {
        setLoading(false);
        return;
      }

      const token =
        localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/lesson-progress/${lesson.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (
          response.data?.progress?.completed
        ) {
          setCompleted(true);
        }
      } catch (error) {
        console.error(
          'Could not load lesson progress:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [lesson]);


  /* =========================
     LOAD PREVIOUS QUIZ RESULT
  ========================= */

  useEffect(() => {
    const loadQuizResult = async () => {
      if (!lesson) {
        return;
      }

      const token =
        localStorage.getItem('token');

      if (!token) {
        return;
      }

      setQuizResultLoading(true);

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/quiz/${lesson.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.result) {
          setPreviousQuizResult(
            response.data.result
          );
        } else {
          setPreviousQuizResult(null);
        }
      } catch (error) {
        console.error(
          'Could not load quiz result:',
          error
        );
      } finally {
        setQuizResultLoading(false);
      }
    };

    loadQuizResult();
  }, [lesson]);


  /* =========================
     RESET QUIZ WHEN LESSON CHANGES
  ========================= */

  useEffect(() => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setQuizFinished(false);
    setQuizScore(0);
    setQuizPercentage(0);
    setQuizMessage('');
    setQuizError('');
  }, [lessonId]);


  /* =========================
     COMPLETE LESSON
  ========================= */

  const handleCompleteLesson = async () => {
    if (!lesson || saving || completed) {
      return;
    }

    const token =
      localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');

    try {
      await axios.post(
        `${API_BASE_URL}/api/lesson-progress/${lesson.id}`,
        {
          completed: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCompleted(true);

      /* =========================
         LOCAL STORAGE SYNC
      ========================= */

      const saved =
        JSON.parse(
          localStorage.getItem(
            'geonixCompletedLessons'
          ) || '[]'
        );

      const safeSaved =
        Array.isArray(saved)
          ? saved
          : [];

      if (!safeSaved.includes(lesson.id)) {
        safeSaved.push(lesson.id);

        localStorage.setItem(
          'geonixCompletedLessons',
          JSON.stringify(safeSaved)
        );
      }

      setMessage(
        'Lesson completed and progress saved!'
      );
    } catch (error) {
      console.error(
        'Could not save lesson progress:',
        error
      );

      setError(
        error.response?.data?.message ||
        'Could not save your progress. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };


  /* =========================
     START QUIZ
  ========================= */

  const handleStartQuiz = () => {
    if (!completed) {
      return;
    }

    setQuizStarted(true);
    setQuizFinished(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setQuizScore(0);
    setQuizPercentage(0);
    setQuizMessage('');
    setQuizError('');
  };


  /* =========================
     SELECT ANSWER
  ========================= */

  const handleSelectAnswer = (answerIndex) => {
    if (quizFinished) {
      return;
    }

    setSelectedAnswer(answerIndex);

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [currentQuestion]: answerIndex,
    }));
  };


  /* =========================
     NEXT QUESTION
  ========================= */

  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      return;
    }

    if (
      currentQuestion <
      quiz.length - 1
    ) {
      const nextIndex =
        currentQuestion + 1;

      setCurrentQuestion(nextIndex);

      setSelectedAnswer(
        answers[nextIndex] ?? null
      );

      return;
    }

    finishQuiz();
  };


  /* =========================
     PREVIOUS QUESTION
  ========================= */

  const handlePreviousQuestion = () => {
    if (currentQuestion <= 0) {
      return;
    }

    const previousIndex =
      currentQuestion - 1;

    setCurrentQuestion(previousIndex);

    setSelectedAnswer(
      answers[previousIndex] ?? null
    );
  };


  /* =========================
     FINISH QUIZ
  ========================= */

  const finishQuiz = async () => {
    if (!quiz.length) {
      return;
    }

    const finalAnswers = {
      ...answers,
      [currentQuestion]: selectedAnswer,
    };

    let score = 0;

    quiz.forEach((question, index) => {
      if (
        finalAnswers[index] ===
        question.correctAnswer
      ) {
        score += 1;
      }
    });

    const percentage =
      Math.round(
        (score / quiz.length) * 100
      );

    setQuizScore(score);
    setQuizPercentage(percentage);
    setQuizFinished(true);

    await saveQuizResult(
      score,
      percentage
    );
  };


  /* =========================
     SAVE QUIZ RESULT
  ========================= */

  const saveQuizResult = async (
    score,
    percentage
  ) => {
    const token =
      localStorage.getItem('token');

    if (!token) {
      setQuizError(
        'Please log in to save your quiz result.'
      );
      return;
    }

    setQuizSaving(true);
    setQuizMessage('');
    setQuizError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/quiz/${lesson.id}`,
        {
          score,
          totalQuestions: quiz.length,
          percentage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPreviousQuizResult(
        response.data?.result || {
          score,
          totalQuestions: quiz.length,
          percentage,
        }
      );

      setQuizMessage(
        'Quiz result saved successfully!'
      );
    } catch (error) {
      console.error(
        'Could not save quiz result:',
        error
      );

      setQuizError(
        error.response?.data?.message ||
        'Could not save your quiz result. Please try again.'
      );
    } finally {
      setQuizSaving(false);
    }
  };


  /* =========================
     RETAKE QUIZ
  ========================= */

  const handleRetakeQuiz = () => {
    setQuizStarted(true);
    setQuizFinished(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setQuizScore(0);
    setQuizPercentage(0);
    setQuizMessage('');
    setQuizError('');
  };


  /* =========================
     GET SCORE MESSAGE
  ========================= */

  const getScoreMessage = () => {
    if (quizPercentage === 100) {
      return 'Perfect score! Excellent work!';
    }

    if (quizPercentage >= 75) {
      return 'Great job! You understand this lesson well.';
    }

    if (quizPercentage >= 50) {
      return 'Good effort! Review the lesson and try again.';
    }

    return 'Keep practicing! Rewatch the lesson and try the quiz again.';
  };


  /* =========================
     LESSON NOT FOUND
  ========================= */

  if (!lesson) {
    return (
      <div className="video-lesson-page">
        <main className="lesson-not-found">

          <div className="not-found-icon">
            📚
          </div>

          <h1>
            Lesson Not Found
          </h1>

          <p>
            The lesson you're looking for
            doesn't exist.
          </p>

          <Link
            to="/video-lessons"
            className="back-lessons-button"
          >
            ← Back to Video Lessons
          </Link>

        </main>
      </div>
    );
  }


  return (
    <div className="video-lesson-page">

      <main className="video-lesson-main">

        {/* =========================
            BREADCRUMB
        ========================= */}

        <div className="lesson-breadcrumb">

          <Link to="/video-lessons">
            Video Lessons
          </Link>

          <span>
            /
          </span>

          <span>
            {lesson.title}
          </span>

        </div>


        {/* =========================
            VIDEO
        ========================= */}

        <section className="lesson-video-card">

          <div className="lesson-video-wrapper">

            <iframe
              src={lesson.videoUrl}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

          </div>

        </section>


        {/* =========================
            LESSON CONTENT
        ========================= */}

        <div className="lesson-layout">

          {/* =========================
              MAIN CONTENT
          ========================= */}

          <section className="lesson-content">

            <div className="lesson-heading-row">

              <div>

                <span className="lesson-category">
                  {lesson.category}
                </span>

                <h1>
                  {lesson.title}
                </h1>

              </div>

              <div
                className={
                  completed
                    ? 'lesson-status completed'
                    : 'lesson-status'
                }
              >
                {loading
                  ? 'Loading...'
                  : completed
                  ? '✓ Completed'
                  : 'Not completed'}
              </div>

            </div>


            {/* META */}

            <div className="lesson-meta">

              <span>
                ⏱️ {lesson.duration || '10 min'}
              </span>

              <span>
                📚 Lesson {currentLessonIndex + 1}
                {' '}of{' '}
                {lessons.length}
              </span>

              <span>
                🎓 {lesson.level || 'Beginner'}
              </span>

            </div>


            {/* DESCRIPTION */}

            <div className="lesson-description">

              <h2>
                About this lesson
              </h2>

              <p>
                {lesson.description ||
                  'Learn important mathematical concepts through a clear, step-by-step video lesson. Follow the explanation carefully and practice what you learn.'}
              </p>

            </div>


            {/* TOPICS */}

            <div className="lesson-topics">

              <h2>
                What you'll learn
              </h2>

              <div className="topic-list">

                {(lesson.topics || [
                  'Understand the main concept',
                  'Follow step-by-step examples',
                  'Apply the concept to math problems',
                ]).map(
                  (topic, index) => (
                    <div
                      className="topic-item"
                      key={index}
                    >

                      <span className="topic-check">
                        ✓
                      </span>

                      <span>
                        {topic}
                      </span>

                    </div>
                  )
                )}

              </div>

            </div>


            {/* COMPLETE LESSON */}

            <div className="lesson-completion">

              <div className="completion-content">

                <div className="completion-icon">
                  {completed
                    ? '✓'
                    : '🎯'}
                </div>

                <div>

                  <h3>
                    {completed
                      ? 'Lesson completed!'
                      : 'Finished watching?'}
                  </h3>

                  <p>
                    {completed
                      ? 'Your progress has been saved to your account.'
                      : 'Mark this lesson as completed to unlock the quiz.'}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={handleCompleteLesson}
                disabled={
                  saving ||
                  completed ||
                  loading
                }
                className={
                  completed
                    ? 'complete-lesson-button completed'
                    : 'complete-lesson-button'
                }
              >
                {saving
                  ? 'Saving...'
                  : completed
                  ? '✓ Completed'
                  : 'Complete Lesson'}
              </button>

            </div>


            {/* LESSON MESSAGES */}

            {message && (
              <div className="lesson-success-message">
                ✓ {message}
              </div>
            )}

            {error && (
              <div className="lesson-error-message">
                {error}
              </div>
            )}


            {/* =========================
                QUIZ
            ========================= */}

            <section className="lesson-quiz-section">

              <div className="quiz-header">

                <div>

                  <span className="quiz-eyebrow">
                    TEST YOUR KNOWLEDGE
                  </span>

                  <h2>
                    Lesson Quiz
                  </h2>

                  <p>
                    Answer the questions to check
                    how well you understood this lesson.
                  </p>

                </div>

                <div className="quiz-header-icon">
                  🧠
                </div>

              </div>


              {/* QUIZ LOCKED */}

              {!completed && (
                <div className="quiz-locked">

                  <div className="quiz-locked-icon">
                    🔒
                  </div>

                  <h3>
                    Quiz Locked
                  </h3>

                  <p>
                    Complete the video lesson first
                    to unlock the quiz.
                  </p>

                </div>
              )}


              {/* QUIZ LOADING */}

              {completed &&
                quizResultLoading && (
                  <div className="quiz-loading">
                    Loading your quiz history...
                  </div>
                )}


              {/* QUIZ START */}

              {completed &&
                !quizStarted &&
                !quizFinished &&
                !quizResultLoading && (

                  <div className="quiz-start">

                    {previousQuizResult ? (

                      <div className="previous-quiz-result">

                        <div className="previous-result-icon">
                          🏆
                        </div>

                        <div>

                          <span>
                            PREVIOUS RESULT
                          </span>

                          <strong>
                            {previousQuizResult.score}
                            /
                            {previousQuizResult.totalQuestions}
                          </strong>

                          <small>
                            {previousQuizResult.percentage}%
                          </small>

                        </div>

                      </div>

                    ) : (

                      <div className="first-quiz-message">

                        <div>
                          ✨
                        </div>

                        <p>
                          You're ready!
                          Complete the quiz to test
                          your understanding.
                        </p>

                      </div>

                    )}

                    <button
                      type="button"
                      className="start-quiz-button"
                      onClick={
                        previousQuizResult
                          ? handleRetakeQuiz
                          : handleStartQuiz
                      }
                    >
                      {previousQuizResult
                        ? 'Retake Quiz →'
                        : 'Start Quiz →'}
                    </button>

                  </div>
                )}


              {/* ACTIVE QUIZ */}

              {completed &&
                quizStarted &&
                !quizFinished &&
                currentQuizQuestion && (

                  <div className="quiz-container">

                    {/* PROGRESS */}

                    <div className="quiz-question-progress">

                      <div className="quiz-progress-top">

                        <span>
                          Question {currentQuestion + 1}
                          {' '}of{' '}
                          {quiz.length}
                        </span>

                        <span>
                          {Math.round(
                            ((currentQuestion + 1) /
                              quiz.length) *
                              100
                          )}%
                        </span>

                      </div>

                      <div className="quiz-progress-bar">

                        <div
                          className="quiz-progress-fill"
                          style={{
                            width: `${
                              ((currentQuestion + 1) /
                                quiz.length) *
                              100
                            }%`,
                          }}
                        />

                      </div>

                    </div>


                    {/* QUESTION */}

                    <div className="quiz-question-card">

                      <span className="quiz-question-number">
                        Question {currentQuestion + 1}
                      </span>

                      <h3>
                        {currentQuizQuestion.question}
                      </h3>

                      <div className="quiz-options">

                        {currentQuizQuestion.options.map(
                          (
                            option,
                            index
                          ) => {

                            const isSelected =
                              selectedAnswer === index;

                            return (
                              <button
                                type="button"
                                key={index}
                                onClick={() =>
                                  handleSelectAnswer(
                                    index
                                  )
                                }
                                className={
                                  isSelected
                                    ? 'quiz-option selected'
                                    : 'quiz-option'
                                }
                              >

                                <span className="quiz-option-letter">
                                  {String.fromCharCode(
                                    65 + index
                                  )}
                                </span>

                                <span>
                                  {option}
                                </span>

                              </button>
                            );
                          }
                        )}

                      </div>

                    </div>


                    {/* NAVIGATION */}

                    <div className="quiz-navigation">

                      <button
                        type="button"
                        onClick={
                          handlePreviousQuestion
                        }
                        disabled={
                          currentQuestion === 0
                        }
                        className="quiz-previous-button"
                      >
                        ← Previous
                      </button>

                      <span>
                        {selectedAnswer === null
                          ? 'Select an answer'
                          : 'Answer selected ✓'}
                      </span>

                      <button
                        type="button"
                        onClick={
                          handleNextQuestion
                        }
                        disabled={
                          selectedAnswer === null ||
                          quizSaving
                        }
                        className="quiz-next-button"
                      >
                        {currentQuestion ===
                        quiz.length - 1
                          ? 'Finish Quiz'
                          : 'Next →'}
                      </button>

                    </div>

                  </div>
                )}


              {/* QUIZ RESULT */}

              {completed &&
                quizFinished && (

                  <div className="quiz-result">

                    <div className="quiz-result-icon">
                      {quizPercentage >= 75
                        ? '🏆'
                        : quizPercentage >= 50
                        ? '⭐'
                        : '💪'}
                    </div>

                    <span className="quiz-result-label">
                      QUIZ COMPLETE
                    </span>

                    <h3>
                      {getScoreMessage()}
                    </h3>

                    <div className="quiz-score-circle">

                      <strong>
                        {quizPercentage}%
                      </strong>

                      <span>
                        {quizScore} / {quiz.length}
                        {' '}correct
                      </span>

                    </div>

                    <p className="quiz-result-description">
                      {quizPercentage >= 75
                        ? 'Excellent work! Keep building your math skills.'
                        : 'Review the lesson material and try the quiz again to improve your score.'}
                    </p>

                    {quizSaving && (
                      <div className="quiz-saving-message">
                        Saving your result...
                      </div>
                    )}

                    {quizMessage && (
                      <div className="quiz-success-message">
                        ✓ {quizMessage}
                      </div>
                    )}

                    {quizError && (
                      <div className="quiz-error-message">
                        {quizError}
                      </div>
                    )}

                    <div className="quiz-result-actions">

                      <button
                        type="button"
                        className="retake-quiz-button"
                        onClick={
                          handleRetakeQuiz
                        }
                      >
                        ↻ Retake Quiz
                      </button>

                      {nextLesson ? (

                        <Link
                          to={`/video-lessons/${nextLesson.id}`}
                          className="next-lesson-button"
                        >
                          Next Lesson →
                        </Link>

                      ) : (

                        <Link
                          to="/video-lessons"
                          className="next-lesson-button"
                        >
                          All Lessons →
                        </Link>

                      )}

                    </div>

                  </div>
                )}

            </section>


            {/* =========================
                LESSON NAVIGATION
            ========================= */}

            <div className="lesson-navigation">

              {previousLesson ? (

                <Link
                  to={`/video-lessons/${previousLesson.id}`}
                  className="lesson-nav-button previous"
                >

                  <span>
                    ←
                  </span>

                  <div>

                    <small>
                      Previous Lesson
                    </small>

                    <strong>
                      {previousLesson.title}
                    </strong>

                  </div>

                </Link>

              ) : (
                <div />
              )}

              {nextLesson ? (

                <Link
                  to={`/video-lessons/${nextLesson.id}`}
                  className="lesson-nav-button next"
                >

                  <div>

                    <small>
                      Next Lesson
                    </small>

                    <strong>
                      {nextLesson.title}
                    </strong>

                  </div>

                  <span>
                    →
                  </span>

                </Link>

              ) : (

                <Link
                  to="/video-lessons"
                  className="lesson-nav-button next"
                >

                  <div>

                    <small>
                      All Lessons
                    </small>

                    <strong>
                      Review Lessons
                    </strong>

                  </div>

                  <span>
                    →
                  </span>

                </Link>

              )}

            </div>

          </section>


          {/* =========================
              SIDEBAR
          ========================= */}

          <aside className="lesson-sidebar">

            <div className="sidebar-card">

              <div className="sidebar-title-row">

                <h3>
                  Course Progress
                </h3>

                <span>
                  {currentLessonIndex + 1}/
                  {lessons.length}
                </span>

              </div>

              <div className="sidebar-progress">

                <div
                  className="sidebar-progress-fill"
                  style={{
                    width: `${
                      ((currentLessonIndex + 1) /
                        lessons.length) *
                      100
                    }%`,
                  }}
                />

              </div>

              <div className="sidebar-lessons">

                {lessons.map(
                  (item, index) => {

                    const isCurrent =
                      item.id === lesson.id;

                    const isCompleted =
                      completed &&
                      isCurrent;

                    return (
                      <Link
                        key={item.id}
                        to={`/video-lessons/${item.id}`}
                        className={
                          isCurrent
                            ? 'sidebar-lesson current'
                            : 'sidebar-lesson'
                        }
                      >

                        <div className="sidebar-lesson-number">

                          {isCompleted
                            ? '✓'
                            : index + 1}

                        </div>

                        <div className="sidebar-lesson-info">

                          <strong>
                            {item.title}
                          </strong>

                          <span>
                            {item.duration ||
                              '10 min'}
                          </span>

                        </div>

                      </Link>
                    );
                  }
                )}

              </div>

            </div>


            {/* PRACTICE CARD */}

            <div className="sidebar-practice-card">

              <div className="sidebar-practice-icon">
                ✏️
              </div>

              <h3>
                Ready to practice?
              </h3>

              <p>
                Test your understanding with
                math practice questions.
              </p>

              <Link
                to="/practice"
                className="sidebar-practice-button"
              >
                Start Practice →
              </Link>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
};

export default VideoLesson;