import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Practice.css';

/* =========================
   CATEGORY NAMES
========================= */

const categoryNames = {
  addition: 'Addition & Subtraction',
  multiplication: 'Multiplication & Division',
  fractions: 'Fractions',
  algebra: 'Algebra',
  geometry: 'Geometry',
};

/* =========================
   DIFFICULTY NAMES
========================= */

const difficultyNames = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

/* =========================
   XP VALUES
========================= */

const difficultyXP = {
  easy: 10,
  medium: 20,
  hard: 30,
};

const TOTAL_QUESTIONS = 10;

/* =========================================================
   RANDOM HELPERS
========================================================= */

const randomNumber = (min, max) => {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
};

const shuffleArray = (array) => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(
      Math.random() * (i + 1)
    );

    [shuffled[i], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[i],
    ];
  }

  return shuffled;
};

/* =========================================================
   NUMERIC ANSWER OPTIONS
========================================================= */

const createOptions = (correctAnswer) => {
  const correct = Number(correctAnswer);

  const options = new Set();

  options.add(String(correct));

  while (options.size < 4) {
    let difference;

    if (Math.abs(correct) >= 100) {
      difference = randomNumber(-50, 50);
    } else if (Math.abs(correct) >= 30) {
      difference = randomNumber(-20, 20);
    } else {
      difference = randomNumber(-10, 10);
    }

    if (difference === 0) {
      continue;
    }

    const wrongAnswer =
      correct + difference;

    if (wrongAnswer >= 0) {
      options.add(String(wrongAnswer));
    }
  }

  return shuffleArray(
    Array.from(options)
  );
};

/* =========================================================
   ADDITION & SUBTRACTION
========================================================= */

const generateAdditionQuestion = (
  difficulty
) => {
  /* =========================
     EASY
  ========================= */

  if (difficulty === 'easy') {
    const questionType =
      randomNumber(0, 2);

    if (questionType === 0) {
      const a = randomNumber(1, 20);
      const b = randomNumber(1, 20);

      const answer = a + b;

      return {
        question:
          `What is ${a} + ${b}?`,
        options:
          createOptions(answer),
        answer: String(answer),
        explanation:
          `${a} + ${b} = ${answer}.`,
      };
    }

    if (questionType === 1) {
      let a = randomNumber(1, 30);
      let b = randomNumber(1, 20);

      if (b > a) {
        [a, b] = [b, a];
      }

      const answer = a - b;

      return {
        question:
          `What is ${a} − ${b}?`,
        options:
          createOptions(answer),
        answer: String(answer),
        explanation:
          `${a} − ${b} = ${answer}.`,
      };
    }

    const first =
      randomNumber(1, 15);

    const answer =
      randomNumber(1, 15);

    const total =
      first + answer;

    return {
      question:
        `What number is missing? ${first} + □ = ${total}`,
      options:
        createOptions(answer),
      answer: String(answer),
      explanation:
        `Subtract ${first} from ${total}: ${total} − ${first} = ${answer}.`,
    };
  }

  /* =========================
     MEDIUM
  ========================= */

  if (difficulty === 'medium') {
    const questionType =
      randomNumber(0, 3);

    if (questionType === 0) {
      const a =
        randomNumber(20, 200);

      const b =
        randomNumber(20, 200);

      const answer = a + b;

      return {
        question:
          `What is ${a} + ${b}?`,
        options:
          createOptions(answer),
        answer: String(answer),
        explanation:
          `${a} + ${b} = ${answer}.`,
      };
    }

    if (questionType === 1) {
      let a =
        randomNumber(50, 300);

      let b =
        randomNumber(20, 200);

      if (b > a) {
        [a, b] = [b, a];
      }

      const answer = a - b;

      return {
        question:
          `What is ${a} − ${b}?`,
        options:
          createOptions(answer),
        answer: String(answer),
        explanation:
          `${a} − ${b} = ${answer}.`,
      };
    }

    if (questionType === 2) {
      const first =
        randomNumber(20, 100);

      const answer =
        randomNumber(20, 100);

      const total =
        first + answer;

      return {
        question:
          `What number is missing? ${first} + □ = ${total}`,
        options:
          createOptions(answer),
        answer: String(answer),
        explanation:
          `Subtract ${first} from ${total}: ${total} − ${first} = ${answer}.`,
      };
    }

    const first =
      randomNumber(50, 300);

    const answer =
      randomNumber(
        20,
        first - 1
      );

    const total =
      first - answer;

    return {
      question:
        `What number is missing? ${first} − □ = ${total}`,
      options:
        createOptions(answer),
      answer: String(answer),
      explanation:
        `Subtract ${total} from ${first}: ${first} − ${total} = ${answer}.`,
    };
  }

  /* =========================
     HARD
  ========================= */

  const questionType =
    randomNumber(0, 3);

  if (questionType === 0) {
    const a =
      randomNumber(100, 999);

    const b =
      randomNumber(100, 999);

    const answer = a + b;

    return {
      question:
        `What is ${a} + ${b}?`,
      options:
        createOptions(answer),
      answer: String(answer),
      explanation:
        `${a} + ${b} = ${answer}.`,
    };
  }

  if (questionType === 1) {
    let a =
      randomNumber(300, 999);

    let b =
      randomNumber(100, 800);

    if (b > a) {
      [a, b] = [b, a];
    }

    const answer = a - b;

    return {
      question:
        `What is ${a} − ${b}?`,
      options:
        createOptions(answer),
      answer: String(answer),
      explanation:
        `${a} − ${b} = ${answer}.`,
    };
  }

  if (questionType === 2) {
    const first =
      randomNumber(100, 500);

    const add =
      randomNumber(20, 100);

    const subtract =
      randomNumber(
        10,
        add - 1
      );

    const answer =
      first + add - subtract;

    return {
      question:
        `What is ${first} + ${add} − ${subtract}?`,
      options:
        createOptions(answer),
      answer: String(answer),
      explanation:
        `First add ${add}: ${first} + ${add} = ${first + add}. ` +
        `Then subtract ${subtract}: ${first + add} − ${subtract} = ${answer}.`,
    };
  }

  const first =
    randomNumber(100, 500);

  const answer =
    randomNumber(50, 300);

  const add =
    randomNumber(20, 100);

  const total =
    first + answer - add;

  return {
    question:
      `${first} + □ − ${add} = ${total}`,
    options:
      createOptions(answer),
    answer: String(answer),
    explanation:
      `First add ${add} to ${total}: ${total} + ${add} = ${first + answer}. ` +
      `Then subtract ${first}: ${first + answer} − ${first} = ${answer}.`,
  };
};

/* =========================================================
   MULTIPLICATION & DIVISION
========================================================= */

const generateMultiplicationQuestion = (
  difficulty
) => {
  /* =========================
     EASY
  ========================= */

  if (difficulty === 'easy') {
    const questionType =
      randomNumber(0, 3);

    if (questionType === 0) {
      const a =
        randomNumber(2, 10);

      const b =
        randomNumber(2, 10);

      const answer = a * b;

      return {
        question:
          `What is ${a} × ${b}?`,
        options:
          createOptions(answer),
        answer: String(answer),
        explanation:
          `${a} × ${b} = ${answer}.`,
      };
    }

    if (questionType === 1) {
      const divisor =
        randomNumber(2, 10);

      const quotient =
        randomNumber(2, 10);

      const dividend =
        divisor * quotient;

      return {
        question:
          `What is ${dividend} ÷ ${divisor}?`,
        options:
          createOptions(quotient),
        answer: String(quotient),
        explanation:
          `${dividend} ÷ ${divisor} = ${quotient}.`,
      };
    }

    if (questionType === 2) {
      const missing =
        randomNumber(2, 10);

      const multiplier =
        randomNumber(2, 10);

      const total =
        missing * multiplier;

      return {
        question:
          `What number is missing? □ × ${multiplier} = ${total}`,
        options:
          createOptions(missing),
        answer: String(missing),
        explanation:
          `Divide ${total} by ${multiplier}: ${total} ÷ ${multiplier} = ${missing}.`,
      };
    }

    const divisor =
      randomNumber(2, 10);

    const quotient =
      randomNumber(2, 10);

    const dividend =
      divisor * quotient;

    return {
      question:
        `What number is missing? ${dividend} ÷ □ = ${quotient}`,
      options:
        createOptions(divisor),
      answer: String(divisor),
      explanation:
        `Divide ${dividend} by ${quotient}: ${dividend} ÷ ${quotient} = ${divisor}.`,
    };
  }

  /* =========================
     MEDIUM
  ========================= */

  if (difficulty === 'medium') {
    const questionType =
      randomNumber(0, 3);

    if (questionType === 0) {
      const a =
        randomNumber(3, 20);

      const b =
        randomNumber(3, 12);

      const answer = a * b;

      return {
        question:
          `What is ${a} × ${b}?`,
        options:
          createOptions(answer),
        answer: String(answer),
        explanation:
          `${a} × ${b} = ${answer}.`,
      };
    }

    if (questionType === 1) {
      const divisor =
        randomNumber(3, 12);

      const quotient =
        randomNumber(3, 20);

      const dividend =
        divisor * quotient;

      return {
        question:
          `What is ${dividend} ÷ ${divisor}?`,
        options:
          createOptions(quotient),
        answer: String(quotient),
        explanation:
          `${dividend} ÷ ${divisor} = ${quotient}.`,
      };
    }

    if (questionType === 2) {
      const missing =
        randomNumber(3, 20);

      const multiplier =
        randomNumber(3, 12);

      const total =
        missing * multiplier;

      return {
        question:
          `What number is missing? □ × ${multiplier} = ${total}`,
        options:
          createOptions(missing),
        answer: String(missing),
        explanation:
          `Divide ${total} by ${multiplier}: ${total} ÷ ${multiplier} = ${missing}.`,
      };
    }

    const divisor =
      randomNumber(3, 12);

    const quotient =
      randomNumber(3, 20);

    const dividend =
      divisor * quotient;

    return {
      question:
        `What number is missing? ${dividend} ÷ □ = ${quotient}`,
      options:
        createOptions(divisor),
      answer: String(divisor),
      explanation:
        `Divide ${dividend} by ${quotient}: ${dividend} ÷ ${quotient} = ${divisor}.`,
    };
  }

  /* =========================
     HARD
  ========================= */

  const questionType =
    randomNumber(0, 3);

  if (questionType === 0) {
    const a =
      randomNumber(10, 60);

    const b =
      randomNumber(5, 30);

    const answer = a * b;

    return {
      question:
        `What is ${a} × ${b}?`,
      options:
        createOptions(answer),
      answer: String(answer),
      explanation:
        `${a} × ${b} = ${answer}.`,
    };
  }

  if (questionType === 1) {
    const divisor =
      randomNumber(5, 30);

    const quotient =
      randomNumber(10, 60);

    const dividend =
      divisor * quotient;

    return {
      question:
        `What is ${dividend} ÷ ${divisor}?`,
      options:
        createOptions(quotient),
      answer: String(quotient),
      explanation:
        `${dividend} ÷ ${divisor} = ${quotient}.`,
    };
  }

  if (questionType === 2) {
    const a =
      randomNumber(5, 20);

    const b =
      randomNumber(5, 15);

    const c =
      randomNumber(5, 20);

    const answer =
      a * b + c;

    return {
      question:
        `What is ${a} × ${b} + ${c}?`,
      options:
        createOptions(answer),
      answer: String(answer),
      explanation:
        `First multiply ${a} × ${b} = ${a * b}. ` +
        `Then add ${c}: ${a * b} + ${c} = ${answer}.`,
    };
  }

  const missing =
    randomNumber(10, 40);

  const multiplier =
    randomNumber(10, 30);

  const total =
    missing * multiplier;

  return {
    question:
      `What number is missing? □ × ${multiplier} = ${total}`,
    options:
      createOptions(missing),
    answer: String(missing),
    explanation:
      `Divide ${total} by ${multiplier}: ${total} ÷ ${multiplier} = ${missing}.`,
  };
};

/* =========================================================
   FRACTIONS
========================================================= */

const simplifyFraction = (
  numerator,
  denominator
) => {
  const gcd = (a, b) => {
    let x = Math.abs(a);
    let y = Math.abs(b);

    while (y !== 0) {
      const temp = y;
      y = x % y;
      x = temp;
    }

    return x;
  };

  const divisor =
    gcd(
      numerator,
      denominator
    );

  return {
    numerator:
      numerator / divisor,
    denominator:
      denominator / divisor,
  };
};

const fractionToString = (
  numerator,
  denominator
) => {
  const simplified =
    simplifyFraction(
      numerator,
      denominator
    );

  if (
    simplified.denominator === 1
  ) {
    return String(
      simplified.numerator
    );
  }

  return `${simplified.numerator}/${simplified.denominator}`;
};

const generateFractionQuestion = (
  difficulty
) => {
  /* =========================
     EASY
  ========================= */

  if (difficulty === 'easy') {
    const denominator =
      randomNumber(2, 8);

    const numerator =
      randomNumber(
        1,
        denominator - 1
      );

    const multiplier =
      randomNumber(2, 4);

    const correctAnswer =
      fractionToString(
        numerator * multiplier,
        denominator * multiplier
      );

    const wrong1 =
      fractionToString(
        numerator + 1,
        denominator
      );

    const wrong2 =
      fractionToString(
        numerator,
        denominator + 1
      );

    const wrong3 =
      fractionToString(
        numerator * multiplier + 1,
        denominator * multiplier
      );

    const options =
      new Set([
        correctAnswer,
        wrong1,
        wrong2,
        wrong3,
      ]);

    return {
      question:
        `Which fraction is equivalent to ${numerator}/${denominator}?`,
      options:
        shuffleArray(
          Array.from(options)
        ),
      answer:
        correctAnswer,
      explanation:
        `Multiply the numerator and denominator by ${multiplier}: ` +
        `${numerator} × ${multiplier} / ` +
        `${denominator} × ${multiplier} = ${correctAnswer}.`,
    };
  }

  /* =========================
     MEDIUM
  ========================= */

  if (difficulty === 'medium') {
    const denominator =
      randomNumber(3, 10);

    let first =
      randomNumber(
        1,
        denominator - 1
      );

    let second =
      randomNumber(
        1,
        denominator - 1
      );

    const useSubtraction =
      Math.random() < 0.5;

    if (!useSubtraction) {
      const numerator =
        first + second;

      const answer =
        fractionToString(
          numerator,
          denominator
        );

      const wrong1 =
        fractionToString(
          numerator + 1,
          denominator
        );

      const wrong2 =
        fractionToString(
          Math.max(
            1,
            numerator - 1
          ),
          denominator
        );

      const wrong3 =
        fractionToString(
          numerator,
          denominator + 1
        );

      const options =
        new Set([
          answer,
          wrong1,
          wrong2,
          wrong3,
        ]);

      return {
        question:
          `What is ${first}/${denominator} + ${second}/${denominator}?`,
        options:
          shuffleArray(
            Array.from(options)
          ),
        answer,
        explanation:
          `The denominators are the same, so add the numerators: ` +
          `${first} + ${second} = ${numerator}. Then simplify if needed.`,
      };
    }

    if (second > first) {
      [first, second] = [
        second,
        first,
      ];
    }

    const numerator =
      first - second;

    const answer =
      fractionToString(
        numerator,
        denominator
      );

    const wrong1 =
      fractionToString(
        numerator + 1,
        denominator
      );

    const wrong2 =
      fractionToString(
        Math.max(
          1,
          numerator - 1
        ),
        denominator
      );

    const wrong3 =
      fractionToString(
        first + second,
        denominator
      );

    const options =
      new Set([
        answer,
        wrong1,
        wrong2,
        wrong3,
      ]);

    return {
      question:
        `What is ${first}/${denominator} − ${second}/${denominator}?`,
      options:
        shuffleArray(
          Array.from(options)
        ),
      answer,
      explanation:
        `The denominators are the same, so subtract the numerators: ` +
        `${first} − ${second} = ${numerator}. Then simplify if needed.`,
    };
  }

  /* =========================
     HARD
  ========================= */

  let denominator1 =
    randomNumber(2, 6);

  let denominator2 =
    randomNumber(2, 6);

  while (
    denominator2 === denominator1
  ) {
    denominator2 =
      randomNumber(2, 6);
  }

  let numerator1 =
    randomNumber(
      1,
      denominator1 - 1
    );

  let numerator2 =
    randomNumber(
      1,
      denominator2 - 1
    );

  const useSubtraction =
    Math.random() < 0.5;

  if (!useSubtraction) {
    const numerator =
      numerator1 * denominator2 +
      numerator2 * denominator1;

    const denominator =
      denominator1 * denominator2;

    const answer =
      fractionToString(
        numerator,
        denominator
      );

    const wrong1 =
      fractionToString(
        numerator + 1,
        denominator
      );

    const wrong2 =
      fractionToString(
        numerator,
        denominator + 1
      );

    const wrong3 =
      fractionToString(
        numerator1 + numerator2,
        denominator
      );

    const options =
      new Set([
        answer,
        wrong1,
        wrong2,
        wrong3,
      ]);

    return {
      question:
        `What is ${numerator1}/${denominator1} + ${numerator2}/${denominator2}?`,
      options:
        shuffleArray(
          Array.from(options)
        ),
      answer,
      explanation:
        `Find a common denominator, combine the fractions, and simplify. ` +
        `The result is ${answer}.`,
    };
  }

  const value1 =
    numerator1 / denominator1;

  const value2 =
    numerator2 / denominator2;

  if (value2 > value1) {
    [numerator1, numerator2] = [
      numerator2,
      numerator1,
    ];

    [denominator1, denominator2] = [
      denominator2,
      denominator1,
    ];
  }

  const numerator =
    numerator1 * denominator2 -
    numerator2 * denominator1;

  const denominator =
    denominator1 * denominator2;

  const answer =
    fractionToString(
      numerator,
      denominator
    );

  const wrong1 =
    fractionToString(
      numerator + 1,
      denominator
    );

  const wrong2 =
    fractionToString(
      Math.max(
        1,
        numerator - 1
      ),
      denominator
    );

  const wrong3 =
    fractionToString(
      numerator1 + numerator2,
      denominator
    );

  const options =
    new Set([
      answer,
      wrong1,
      wrong2,
      wrong3,
    ]);

  return {
    question:
      `What is ${numerator1}/${denominator1} − ${numerator2}/${denominator2}?`,
    options:
      shuffleArray(
        Array.from(options)
      ),
    answer,
    explanation:
      `Find a common denominator, subtract the fractions, and simplify. ` +
      `The result is ${answer}.`,
  };
};

/* =========================================================
   ALGEBRA
========================================================= */

const generateAlgebraQuestion = (
  difficulty
) => {
  /* =========================
     EASY
  ========================= */

  if (difficulty === 'easy') {
    const questionType =
      randomNumber(0, 1);

    if (questionType === 0) {
      const x =
        randomNumber(1, 10);

      const constant =
        randomNumber(1, 10);

      const total =
        x + constant;

      return {
        question:
          `If x + ${constant} = ${total}, what is x?`,
        options:
          createOptions(x),
        answer: String(x),
        explanation:
          `Subtract ${constant} from both sides: ` +
          `${total} − ${constant} = ${x}.`,
      };
    }

    const x =
      randomNumber(1, 10);

    const coefficient =
      randomNumber(2, 3);

    const total =
      coefficient * x;

    return {
      question:
        `If ${coefficient}x = ${total}, what is x?`,
      options:
        createOptions(x),
      answer: String(x),
      explanation:
        `Divide both sides by ${coefficient}: ` +
        `${total} ÷ ${coefficient} = ${x}.`,
    };
  }

  /* =========================
     MEDIUM
  ========================= */

  if (difficulty === 'medium') {
    const questionType =
      randomNumber(0, 2);

    if (questionType === 0) {
      const x =
        randomNumber(1, 20);

      const coefficient =
        randomNumber(2, 6);

      const constant =
        randomNumber(1, 20);

      const total =
        coefficient * x +
        constant;

      return {
        question:
          `If ${coefficient}x + ${constant} = ${total}, what is x?`,
        options:
          createOptions(x),
        answer: String(x),
        explanation:
          `First subtract ${constant}: ${total} − ${constant} = ${coefficient}x. ` +
          `Then divide by ${coefficient}: x = ${x}.`,
      };
    }

    if (questionType === 1) {
      const x =
        randomNumber(1, 20);

      const constant =
        randomNumber(10, 30);

      const total =
        x + constant;

      return {
        question:
          `□ + ${constant} = ${total}`,
        options:
          createOptions(x),
        answer: String(x),
        explanation:
          `Subtract ${constant} from ${total}: ${total} − ${constant} = ${x}.`,
      };
    }

    const x =
      randomNumber(1, 20);

    const coefficient =
      randomNumber(2, 6);

    const total =
      coefficient * x;

    return {
      question:
        `If ${coefficient}x = ${total}, what is x?`,
      options:
        createOptions(x),
      answer: String(x),
      explanation:
        `Divide ${total} by ${coefficient}: ${total} ÷ ${coefficient} = ${x}.`,
    };
  }

  /* =========================
     HARD
  ========================= */

  const x =
    randomNumber(2, 30);

  const leftCoefficient =
    randomNumber(2, 8);

  const rightCoefficient =
    randomNumber(
      1,
      leftCoefficient - 1
    );

  const leftConstant =
    randomNumber(5, 30);

  const rightConstant =
    leftCoefficient * x +
    leftConstant -
    rightCoefficient * x;

  return {
    question:
      `If ${leftCoefficient}x + ${leftConstant} = ${rightCoefficient}x + ${rightConstant}, what is x?`,
    options:
      createOptions(x),
    answer: String(x),
    explanation:
      `Move the x terms to one side and the constants to the other side. ` +
      `After simplifying, x = ${x}.`,
  };
};

/* =========================================================
   GEOMETRY
========================================================= */

const generateGeometryQuestion = (
  difficulty
) => {
  /* =========================
     EASY
  ========================= */

  if (difficulty === 'easy') {
    const questionType =
      randomNumber(0, 3);

    if (questionType === 0) {
      const side =
        randomNumber(2, 10);

      const perimeter =
        side * 4;

      return {
        question:
          `What is the perimeter of a square with side ${side}?`,
        options:
          createOptions(perimeter),
        answer: String(perimeter),
        explanation:
          `A square has 4 equal sides: ${side} × 4 = ${perimeter}.`,
      };
    }

    if (questionType === 1) {
      const side =
        randomNumber(2, 10);

      const area =
        side * side;

      return {
        question:
          `What is the area of a square with side ${side}?`,
        options:
          createOptions(area),
        answer: String(area),
        explanation:
          `Area = side × side = ${side} × ${side} = ${area}.`,
      };
    }

    if (questionType === 2) {
      const length =
        randomNumber(3, 10);

      const width =
        randomNumber(2, 8);

      const area =
        length * width;

      return {
        question:
          `What is the area of a rectangle with length ${length} and width ${width}?`,
        options:
          createOptions(area),
        answer: String(area),
        explanation:
          `Area = length × width = ${length} × ${width} = ${area}.`,
      };
    }

    const length =
      randomNumber(3, 10);

    const width =
      randomNumber(2, 8);

    const perimeter =
      2 * (length + width);

    return {
      question:
        `What is the perimeter of a rectangle with length ${length} and width ${width}?`,
      options:
        createOptions(perimeter),
      answer: String(perimeter),
      explanation:
        `Perimeter = 2 × (${length} + ${width}) = ${perimeter}.`,
    };
  }

  /* =========================
     MEDIUM
  ========================= */

  if (difficulty === 'medium') {
    const questionType =
      randomNumber(0, 3);

    if (questionType === 0) {
      const length =
        randomNumber(5, 20);

      const width =
        randomNumber(3, 12);

      const area =
        length * width;

      return {
        question:
          `What is the area of a rectangle with length ${length} and width ${width}?`,
        options:
          createOptions(area),
        answer: String(area),
        explanation:
          `Area = length × width = ${length} × ${width} = ${area}.`,
      };
    }

    if (questionType === 1) {
      const length =
        randomNumber(5, 20);

      const width =
        randomNumber(3, 12);

      const perimeter =
        2 * (length + width);

      return {
        question:
          `What is the perimeter of a rectangle with length ${length} and width ${width}?`,
        options:
          createOptions(perimeter),
        answer: String(perimeter),
        explanation:
          `Perimeter = 2 × (${length} + ${width}) = ${perimeter}.`,
      };
    }

    if (questionType === 2) {
      const base =
        randomNumber(4, 20);

      const height =
        randomNumber(4, 15);

      const area =
        (base * height) / 2;

      return {
        question:
          `What is the area of a triangle with base ${base} and height ${height}?`,
        options:
          createOptions(area),
        answer: String(area),
        explanation:
          `Triangle area = (base × height) ÷ 2 = ` +
          `(${base} × ${height}) ÷ 2 = ${area}.`,
      };
    }

    const width =
      randomNumber(3, 12);

    const length =
      randomNumber(5, 20);

    const area =
      length * width;

    return {
      question:
        `A rectangle has area ${area} and length ${length}. What is its width?`,
      options:
        createOptions(width),
      answer: String(width),
      explanation:
        `Width = area ÷ length = ${area} ÷ ${length} = ${width}.`,
    };
  }

  /* =========================
     HARD
  ========================= */

  const questionType =
    randomNumber(0, 3);

  if (questionType === 0) {
    const base =
      randomNumber(8, 30);

    const height =
      randomNumber(6, 20);

    const area =
      (base * height) / 2;

    return {
      question:
        `What is the area of a triangle with base ${base} and height ${height}?`,
      options:
        createOptions(area),
      answer: String(area),
      explanation:
        `Area = (base × height) ÷ 2 = ` +
        `(${base} × ${height}) ÷ 2 = ${area}.`,
    };
  }

  if (questionType === 1) {
    const radius =
      randomNumber(2, 10);

    const area =
      Math.round(
        3.14 *
        radius *
        radius
      );

    return {
      question:
        `Approximately, what is the area of a circle with radius ${radius}? Use π ≈ 3.14.`,
      options:
        createOptions(area),
      answer: String(area),
      explanation:
        `Circle area ≈ π × r² = ` +
        `3.14 × ${radius} × ${radius} ≈ ${area}.`,
    };
  }

  if (questionType === 2) {
    const length =
      randomNumber(10, 30);

    const width =
      randomNumber(5, 20);

    const perimeter =
      2 * (length + width);

    return {
      question:
        `A rectangle has perimeter ${perimeter} and length ${length}. What is its width?`,
      options:
        createOptions(width),
      answer: String(width),
      explanation:
        `First divide the perimeter by 2: ${perimeter} ÷ 2 = ${length + width}. ` +
        `Then subtract the length: ${length + width} − ${length} = ${width}.`,
    };
  }

  const side =
    randomNumber(10, 30);

  const perimeter =
    side * 4;

  return {
    question:
      `A square has perimeter ${perimeter}. What is the length of one side?`,
    options:
      createOptions(side),
    answer: String(side),
    explanation:
      `A square has 4 equal sides, so divide the perimeter by 4: ${perimeter} ÷ 4 = ${side}.`,
  };
};

/* =========================================================
   MAIN QUESTION GENERATOR
========================================================= */

const generateQuestion = (
  category,
  difficulty
) => {
  switch (category) {
    case 'addition':
      return generateAdditionQuestion(
        difficulty
      );

    case 'multiplication':
      return generateMultiplicationQuestion(
        difficulty
      );

    case 'fractions':
      return generateFractionQuestion(
        difficulty
      );

    case 'algebra':
      return generateAlgebraQuestion(
        difficulty
      );

    case 'geometry':
      return generateGeometryQuestion(
        difficulty
      );

    default:
      return generateAdditionQuestion(
        difficulty
      );
  }
};

/* =========================================================
   CREATE UNIQUE PRACTICE SESSION
========================================================= */

const createPracticeSession = (
  category,
  difficulty
) => {
  const session = [];

  const usedQuestions =
    new Set();

  let attempts = 0;

  while (
    session.length <
      TOTAL_QUESTIONS &&
    attempts < 500
  ) {
    attempts++;

    const newQuestion =
      generateQuestion(
        category,
        difficulty
      );

    const questionKey =
      newQuestion.question;

    if (
      !usedQuestions.has(
        questionKey
      )
    ) {
      usedQuestions.add(
        questionKey
      );

      session.push(
        newQuestion
      );
    }
  }

  return session;
};

/* =========================================================
   PRACTICE COMPONENT
========================================================= */

const Practice = () => {
  const [category, setCategory] =
    useState('addition');

  const [difficulty, setDifficulty] =
    useState('easy');

  const [started, setStarted] =
    useState(false);

  const [showResults, setShowResults] =
    useState(false);

  const [questions, setQuestions] =
    useState([]);

  const [questionIndex, setQuestionIndex] =
    useState(0);

  const [userAnswer, setUserAnswer] =
    useState('');

  const [sessionCorrect, setSessionCorrect] =
    useState(0);

  const [sessionAnswered, setSessionAnswered] =
    useState(0);

  const [sessionXP, setSessionXP] =
    useState(0);

  /* =========================
     STREAK
  ========================= */

  const [streak, setStreak] =
    useState(
      Number(
        localStorage.getItem(
          'streak'
        ) || 0
      )
    );

  const [bestStreak, setBestStreak] =
    useState(
      Number(
        localStorage.getItem(
          'bestStreak'
        ) || 0
      )
    );

  const [feedback, setFeedback] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [answered, setAnswered] =
    useState(false);

  /* =========================================================
     CURRENT QUESTION
  ========================================================= */

  const currentQuestion =
    questions[questionIndex];

  /* =========================================================
     START PRACTICE
  ========================================================= */

  const startPractice = () => {
    const newSession =
      createPracticeSession(
        category,
        difficulty
      );

    setQuestions(newSession);

    setQuestionIndex(0);

    setStarted(true);

    setShowResults(false);

    setUserAnswer('');

    setFeedback('');

    setAnswered(false);

    setSessionCorrect(0);

    setSessionAnswered(0);

    setSessionXP(0);
  };

  /* =========================================================
     CHECK ANSWER
  ========================================================= */

  const handleCheckAnswer =
    async () => {
      if (
        answered ||
        !userAnswer ||
        saving ||
        !currentQuestion
      ) {
        return;
      }

      const isCorrect =
        userAnswer ===
        currentQuestion.answer;

      setAnswered(true);

      setSaving(true);

      setSessionAnswered(
        previous =>
          previous + 1
      );

      if (isCorrect) {
        setSessionCorrect(
          previous =>
            previous + 1
        );
      }

      /* =========================
         XP
      ========================= */

      let earnedXP = 0;

      if (isCorrect) {
        earnedXP =
          difficultyXP[
            difficulty
          ];

        setSessionXP(
          previous =>
            previous + earnedXP
        );

        const currentXP =
          Number(
            localStorage.getItem(
              'xp'
            ) || 0
          );

        localStorage.setItem(
          'xp',
          String(
            currentXP +
              earnedXP
          )
        );

        /* =========================
           STREAK
        ========================= */

        const currentStreak =
          Number(
            localStorage.getItem(
              'streak'
            ) || 0
          );

        const newStreak =
          currentStreak + 1;

        localStorage.setItem(
          'streak',
          String(newStreak)
        );

        setStreak(
          newStreak
        );

        /* =========================
           BEST STREAK
        ========================= */

        const currentBestStreak =
          Number(
            localStorage.getItem(
              'bestStreak'
            ) || 0
          );

        if (
          newStreak >
          currentBestStreak
        ) {
          localStorage.setItem(
            'bestStreak',
            String(newStreak)
          );

          setBestStreak(
            newStreak
          );
        }
      } else {
        /* =========================
           RESET STREAK
        ========================= */

        localStorage.setItem(
          'streak',
          '0'
        );

        setStreak(0);
      }

      /* =========================
         BACKEND PROGRESS
      ========================= */

      try {
        const token =
          localStorage.getItem(
            'token'
          );

        if (!token) {
          throw new Error(
            'No authentication token.'
          );
        }

        const response =
          await axios.post(
            'http://localhost:5001/api/progress/answer',
            {
              correct:
                isCorrect,
              category,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const updatedProgress =
          response.data.progress;

        if (
          updatedProgress
        ) {
          localStorage.setItem(
            'score',
            updatedProgress.correctAnswers
          );

          localStorage.setItem(
            'questionsAnswered',
            updatedProgress.questionsAnswered
          );
        }

        setFeedback(
          isCorrect
            ? 'correct'
            : 'wrong'
        );
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

  /* =========================================================
     NEXT QUESTION
  ========================================================= */

  const handleNextQuestion =
    () => {
      if (
        questionIndex ===
        TOTAL_QUESTIONS - 1
      ) {
        setShowResults(true);
        setStarted(false);
        return;
      }

      setQuestionIndex(
        previous =>
          previous + 1
      );

      setUserAnswer('');

      setFeedback('');

      setAnswered(false);
    };

  /* =========================================================
     CHANGE PRACTICE
  ========================================================= */

  const handleChangePractice =
    () => {
      setStarted(false);

      setShowResults(false);

      setQuestions([]);

      setQuestionIndex(0);

      setUserAnswer('');

      setFeedback('');

      setAnswered(false);

      setSessionCorrect(0);

      setSessionAnswered(0);

      setSessionXP(0);
    };

  /* =========================================================
     RESTART
  ========================================================= */

  const handleRestart = () => {
    startPractice();
  };

  /* =========================================================
     ACCURACY
  ========================================================= */

  const sessionAccuracy =
    sessionAnswered > 0
      ? Math.round(
          (sessionCorrect /
            sessionAnswered) *
            100
        )
      : 0;

  /* =========================================================
     PROGRESS
  ========================================================= */

  const progress = started
    ? Math.round(
        ((questionIndex + 1) /
          TOTAL_QUESTIONS) *
          100
      )
    : 0;

  /* =========================================================
     TOTAL XP
  ========================================================= */

  const totalXP =
    Number(
      localStorage.getItem(
        'xp'
      ) || 0
    );

  /* =========================================================
     RESULT MESSAGE
  ========================================================= */

  const getResultMessage =
    () => {
      if (
        sessionAccuracy ===
        100
      ) {
        return 'Perfect score! Outstanding work! 🏆';
      }

      if (
        sessionAccuracy >= 80
      ) {
        return 'Excellent work! Keep it up! 🌟';
      }

      if (
        sessionAccuracy >= 60
      ) {
        return 'Good job! You are making progress! 💪';
      }

      return 'Keep practicing. You will get better! 🚀';
    };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="practice-page">



      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="practice-main">

        {/* ===================================================
            SELECTION SCREEN
        =================================================== */}

        {!started &&
          !showResults && (
            <>

              <section className="practice-intro">

                <p className="practice-small">
                  Choose your challenge 🎯
                </p>

                <h1>
                  Math Practice 🧮
                </h1>

                <p>
                  Choose a topic and difficulty
                  level before you start practicing.
                </p>

              </section>

              <section className="practice-selection-card">

                {/* CATEGORY */}

                <div className="selection-group">

                  <h2>
                    Choose a category
                  </h2>

                  <div className="selection-options">

                    {Object.entries(
                      categoryNames
                    ).map(
                      ([
                        value,
                        name,
                      ]) => (
                        <button
                          key={value}
                          type="button"
                          className={`selection-option ${
                            category ===
                            value
                              ? 'selected'
                              : ''
                          }`}
                          onClick={() =>
                            setCategory(
                              value
                            )
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
                    ).map(
                      ([
                        value,
                        name,
                      ]) => (
                        <button
                          key={value}
                          type="button"
                          className={`difficulty-option difficulty-${value} ${
                            difficulty ===
                            value
                              ? 'selected'
                              : ''
                          }`}
                          onClick={() =>
                            setDifficulty(
                              value
                            )
                          }
                        >
                          {name}
                        </button>
                      )
                    )}

                  </div>

                </div>

                {/* SESSION PREVIEW */}

                <div className="practice-session-preview">

                  <span>
                    📝
                  </span>

                  <div>

                    <strong>
                      10 Questions
                    </strong>

                    <p>
                      {
                        categoryNames[
                          category
                        ]
                      }{' '}
                      •{' '}
                      {
                        difficultyNames[
                          difficulty
                        ]
                      }
                    </p>

                  </div>

                </div>

                {/* XP PREVIEW */}

                <div className="practice-session-preview">

                  <span>
                    ⭐
                  </span>

                  <div>

                    <strong>
                      {difficultyXP[
                        difficulty
                      ]}{' '}
                      XP per correct answer
                    </strong>

                    <p>
                      Up to{' '}
                      {difficultyXP[
                        difficulty
                      ] *
                        TOTAL_QUESTIONS}{' '}
                      XP this session
                    </p>

                  </div>

                </div>

                {/* CURRENT STREAK */}

                <div className="practice-session-preview">

                  <span>
                    🔥
                  </span>

                  <div>

                    <strong>
                      Current Streak: {streak}
                    </strong>

                    <p>
                      Best Streak: {bestStreak}
                    </p>

                  </div>

                </div>

                {/* START */}

                <button
                  type="button"
                  className="start-practice-button"
                  onClick={
                    startPractice
                  }
                >
                  Start Practice →
                </button>

              </section>

            </>
          )}

        {/* ===================================================
            PRACTICE SESSION
        =================================================== */}

        {started &&
          !showResults &&
          currentQuestion && (
            <>

              <section className="practice-intro">

                <p className="practice-small">

                  {
                    categoryNames[
                      category
                    ]
                  }

                  {' • '}

                  {
                    difficultyNames[
                      difficulty
                    ]
                  }

                </p>

                <h1>
                  Math Practice 🧮
                </h1>

                <p>
                  Solve each question and
                  keep improving.
                </p>

              </section>

              {/* SESSION INFO */}

              <div className="practice-session-info">

                <div className="practice-score">

                  Score:{' '}

                  <strong>
                    {sessionCorrect} /{' '}
                    {sessionAnswered}
                  </strong>

                </div>

                <div className="practice-accuracy">

                  Accuracy:{' '}

                  <strong>
                    {sessionAccuracy}%
                  </strong>

                </div>

                <div className="practice-accuracy">

                  XP:{' '}

                  <strong>
                    ⭐ {sessionXP}
                  </strong>

                </div>

                <div className="practice-accuracy">

                  🔥 Streak:{' '}

                  <strong>
                    {streak}
                  </strong>

                </div>

              </div>

              {/* PROGRESS */}

              <div className="practice-progress-container">

                <div className="practice-progress-header">

                  <span>
                    Question{' '}
                    {questionIndex + 1}{' '}
                    of{' '}
                    {TOTAL_QUESTIONS}
                  </span>

                  <strong>
                    {progress}%
                  </strong>

                </div>

                <div className="practice-progress-track">

                  <div
                    className="practice-progress-bar"
                    style={{
                      width: `${progress}%`,
                    }}
                  />

                </div>

              </div>

              {/* CHANGE TOPIC */}

              <div className="practice-top-row">

                <button
                  type="button"
                  className="change-practice-button"
                  onClick={
                    handleChangePractice
                  }
                >
                  Change Topic
                </button>

              </div>

              {/* QUESTION */}

              <section className="question-card">

                <p className="question-number">

                  Question{' '}

                  {questionIndex + 1}

                </p>

                <h2>
                  {
                    currentQuestion.question
                  }
                </h2>

                {/* ANSWERS */}

                <div className="answer-section">

                  <label>
                    Choose your answer
                  </label>

                  <div className="answer-options">

                    {currentQuestion.options.map(
                      option => (
                        <button
                          key={option}
                          type="button"
                          className={`answer-option ${
                            userAnswer ===
                            option
                              ? 'selected'
                              : ''
                          }`}
                          onClick={() =>
                            setUserAnswer(
                              option
                            )
                          }
                          disabled={
                            answered
                          }
                        >
                          {option}
                        </button>
                      )
                    )}

                  </div>

                </div>

                {/* CHECK ANSWER */}

                {!answered && (
                  <button
                    type="button"
                    className="check-button"
                    onClick={
                      handleCheckAnswer
                    }
                    disabled={
                      !userAnswer ||
                      saving
                    }
                  >
                    {saving
                      ? 'Saving...'
                      : 'Check Answer'}
                  </button>
                )}

                {/* CORRECT */}

                {feedback ===
                  'correct' && (
                  <div className="feedback correct-feedback">

                    <strong>
                      ✓ Correct! Great job! 🔥
                    </strong>

                    <p>
                      ⭐ +
                      {difficultyXP[
                        difficulty
                      ]}{' '}
                      XP
                    </p>

                    <p>
                      🔥 Streak: {streak}
                    </p>

                    {currentQuestion.explanation && (
                      <p>
                        {
                          currentQuestion.explanation
                        }
                      </p>
                    )}

                  </div>
                )}

                {/* WRONG */}

                {feedback ===
                  'wrong' && (
                  <div className="feedback wrong-feedback">

                    <strong>
                      ✕ Not quite.
                    </strong>

                    <p>
                      The correct answer is{' '}
                      <strong>
                        {
                          currentQuestion.answer
                        }
                      </strong>.
                    </p>

                    <p>
                      🔥 Streak reset to 0.
                    </p>

                    {currentQuestion.explanation && (
                      <p>
                        {
                          currentQuestion.explanation
                        }
                      </p>
                    )}

                  </div>
                )}

                {/* SERVER ERROR */}

                {feedback ===
                  'error' && (
                  <div className="feedback wrong-feedback">

                    ✕ Your answer was recorded,
                    but we could not save your
                    progress to the server.

                  </div>
                )}

                {/* NEXT */}

                {answered &&
                  feedback !==
                    'error' && (
                    <button
                      type="button"
                      className="next-button"
                      onClick={
                        handleNextQuestion
                      }
                    >
                      {questionIndex ===
                      TOTAL_QUESTIONS -
                        1
                        ? 'View Results →'
                        : 'Next Question →'}
                    </button>
                  )}

              </section>

              {/* FINISH SESSION */}

              <button
                type="button"
                className="finish-session-button"
                onClick={() => {
                  setShowResults(true);
                  setStarted(false);
                }}
              >
                Finish Session
              </button>

              {/* BACK */}

              <Link
                to="/dashboard"
                className="back-dashboard"
              >
                ← Back to Dashboard
              </Link>

            </>
          )}

        {/* ===================================================
            RESULTS
        =================================================== */}

        {showResults && (
          <section className="practice-results">

            <div className="results-icon">
              🏆
            </div>

            <p className="practice-small">
              Practice Complete
            </p>

            <h1>
              Great Work!
            </h1>

            <p className="results-message">
              {getResultMessage()}
            </p>

            {/* SESSION XP */}

            <div className="results-score-card">

              <div className="results-score">

                <span>
                  ⭐ {sessionXP}
                </span>

              </div>

              <p>
                XP Earned This Session
              </p>

            </div>

            {/* CORRECT ANSWERS */}

            <div className="results-score-card">

              <div className="results-score">

                <span>
                  {sessionCorrect}
                </span>

                <small>
                  / {sessionAnswered}
                </small>

              </div>

              <p>
                Correct Answers
              </p>

            </div>

            {/* RESULTS STATS */}

            <div className="results-stats">

              <div className="result-stat">

                <strong>
                  {sessionAccuracy}%
                </strong>

                <span>
                  Accuracy
                </span>

              </div>

              <div className="result-stat">

                <strong>
                  {sessionAnswered}
                </strong>

                <span>
                  Questions
                </span>

              </div>

              <div className="result-stat">

                <strong>
                  {
                    difficultyNames[
                      difficulty
                    ]
                  }
                </strong>

                <span>
                  Difficulty
                </span>

              </div>

              <div className="result-stat">

                <strong>
                  🔥 {streak}
                </strong>

                <span>
                  Current Streak
                </span>

              </div>

              <div className="result-stat">

                <strong>
                  🏆 {bestStreak}
                </strong>

                <span>
                  Best Streak
                </span>

              </div>

            </div>

            {/* TOTAL XP */}

            <div className="results-score-card">

              <div className="results-score">

                <span>
                  ⭐ {totalXP}
                </span>

              </div>

              <p>
                Total XP
              </p>

            </div>

            {/* ACTIONS */}

            <div className="results-actions">

              <button
                type="button"
                className="start-practice-button"
                onClick={
                  handleRestart
                }
              >
                Practice Again ↻
              </button>

              <button
                type="button"
                className="results-secondary-button"
                onClick={
                  handleChangePractice
                }
              >
                Choose Another Topic
              </button>

            </div>

            {/* PROGRESS */}

            <Link
              to="/score"
              className="back-dashboard"
            >
              View My Progress →
            </Link>

          </section>
        )}

      </main>

    </div>
  );
};

export default Practice;