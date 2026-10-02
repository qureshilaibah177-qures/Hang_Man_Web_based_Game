import { motion } from "framer-motion";

type KeyboardProps = {
  guessedLetters: Set<string>;
  word: string;
  disabled: boolean;
  onGuess: (letter: string) => void;
};

const ROWS = [
  "qwertyuiop".split(""),
  "asdfghjkl".split(""),
  "zxcvbnm".split(""),
];

export function Keyboard({ guessedLetters, word, disabled, onGuess }: KeyboardProps) {
  const getLetterState = (letter: string): "correct" | "wrong" | "unused" => {
    if (!guessedLetters.has(letter)) return "unused";
    return word.includes(letter) ? "correct" : "wrong";
  };

  return (
    <div className="keyboard" role="group" aria-label="Letter keyboard">
      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((letter) => {
            const state = getLetterState(letter);
            const isGuessed = guessedLetters.has(letter);
            return (
              <motion.button
                key={letter}
                className={`key key-${state}`}
                onClick={() => onGuess(letter)}
                disabled={disabled || isGuessed}
                whileTap={{ scale: 0.9 }}
                whileHover={!isGuessed && !disabled ? { scale: 1.1, y: -2 } : {}}
                aria-label={`Letter ${letter.toUpperCase()}`}
              >
                {letter.toUpperCase()}
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
