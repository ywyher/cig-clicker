// constants/question.ts
export const THINK_WINDOW_MS = 5_000;
export const ANSWER_WINDOW_MS = 5_000;
export const QUESTION_INTERVAL_MS = 5_000; // gap *between* questions (after expiry)
export const QUESTION_CYCLE_MS = THINK_WINDOW_MS + ANSWER_WINDOW_MS + QUESTION_INTERVAL_MS;

export interface Question {
  id: number;
  text: string;
  choices: string[];
  correctIndex: number;
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What is the capital of France?",
    choices: ["Berlin", "Madrid", "Paris", "Rome"],
    correctIndex: 2,
  },
  {
    id: 2,
    text: "Which planet is closest to the Sun?",
    choices: ["Venus", "Mercury", "Earth", "Mars"],
    correctIndex: 1,
  },
  {
    id: 3,
    text: "What is 12 × 8?",
    choices: ["84", "96", "108", "72"],
    correctIndex: 1,
  },
  {
    id: 4,
    text: "Who wrote Romeo and Juliet?",
    choices: ["Charles Dickens", "Jane Austen", "William Shakespeare", "Homer"],
    correctIndex: 2,
  },
  {
    id: 5,
    text: "What is the chemical symbol for water?",
    choices: ["O2", "CO2", "H2O", "HO"],
    correctIndex: 2,
  },
  {
    id: 6,
    text: "How many sides does a hexagon have?",
    choices: ["5", "7", "8", "6"],
    correctIndex: 3,
  },
];