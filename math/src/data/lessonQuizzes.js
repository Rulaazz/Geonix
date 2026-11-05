const lessonQuizzes = {
  'algebra-basics': [
    {
      id: 1,
      question: 'What is a variable in algebra?',
      options: [
        'A number that never changes',
        'A letter or symbol that represents a value',
        'An addition sign',
        'A type of shape',
      ],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'If x = 5, what is x + 3?',
      options: ['2', '8', '15', '53'],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: 'Which expression means "a number plus 7"?',
      options: ['x - 7', 'x × 7', 'x + 7', 'x ÷ 7'],
      correctAnswer: 2,
    },
    {
      id: 4,
      question: 'Solve: x + 4 = 10',
      options: ['4', '5', '6', '14'],
      correctAnswer: 2,
    },
  ],

  'fractions-basics': [
    {
      id: 1,
      question: 'Which fraction is equal to one half?',
      options: ['1/3', '2/4', '3/4', '1/4'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'What is 1/4 + 1/4?',
      options: ['1/8', '1/2', '2/8', '3/4'],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: 'Which fraction is the largest?',
      options: ['1/5', '1/2', '1/4', '1/10'],
      correctAnswer: 1,
    },
    {
      id: 4,
      question: 'What is 3/6 in simplest form?',
      options: ['1/2', '2/3', '3/4', '1/3'],
      correctAnswer: 0,
    },
  ],

  'geometry-basics': [
    {
      id: 1,
      question: 'How many sides does a triangle have?',
      options: ['2', '3', '4', '5'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'How many degrees are in a right angle?',
      options: ['45°', '90°', '180°', '360°'],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: 'Which shape has four equal sides?',
      options: ['Triangle', 'Rectangle', 'Square', 'Circle'],
      correctAnswer: 2,
    },
    {
      id: 4,
      question: 'How many degrees are in a full turn?',
      options: ['90°', '180°', '270°', '360°'],
      correctAnswer: 3,
    },
  ],

  'multiplication-division': [
    {
      id: 1,
      question: 'What is 6 × 7?',
      options: ['36', '42', '48', '56'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'What is 36 ÷ 6?',
      options: ['5', '6', '7', '8'],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: 'What is 8 × 5?',
      options: ['35', '40', '45', '50'],
      correctAnswer: 1,
    },
    {
      id: 4,
      question: 'What is 48 ÷ 8?',
      options: ['4', '5', '6', '7'],
      correctAnswer: 2,
    },
  ],

  'linear-equations': [
    {
      id: 1,
      question: 'Solve: x + 5 = 12',
      options: ['5', '6', '7', '17'],
      correctAnswer: 2,
    },
    {
      id: 2,
      question: 'Solve: x - 3 = 8',
      options: ['5', '10', '11', '24'],
      correctAnswer: 2,
    },
    {
      id: 3,
      question: 'Solve: 2x = 14',
      options: ['5', '6', '7', '8'],
      correctAnswer: 2,
    },
    {
      id: 4,
      question: 'What should you do first to solve x + 9 = 15?',
      options: [
        'Multiply by 9',
        'Subtract 9 from both sides',
        'Add 9 to both sides',
        'Divide by 15',
      ],
      correctAnswer: 1,
    },
  ],

  'advanced-geometry': [
    {
      id: 1,
      question: 'What is the area of a rectangle with length 8 and width 5?',
      options: ['13', '26', '40', '80'],
      correctAnswer: 2,
    },
    {
      id: 2,
      question: 'What is the perimeter of a square with side length 6?',
      options: ['12', '18', '24', '36'],
      correctAnswer: 2,
    },
    {
      id: 3,
      question: 'What is the area of a triangle with base 10 and height 6?',
      options: ['16', '30', '60', '120'],
      correctAnswer: 1,
    },
    {
      id: 4,
      question: 'How many degrees are in the interior angles of a triangle altogether?',
      options: ['90°', '180°', '270°', '360°'],
      correctAnswer: 1,
    },
  ],
};

export default lessonQuizzes;