import { motion } from "framer-motion";

type WordDisplayProps = {
  word: string;
  guessedLetters: Set<string>;
  reveal: boolean;
};

export function WordDisplay({ word, guessedLetters, reveal }: WordDisplayProps) {
  const chars = word.split("");

  return (
    <div className="word-display" aria-label="Word to guess">
      {chars.map((char, i) => {
        const isLetter = /[a-z]/.test(char);
        const isGuessed = guessedLetters.has(char);
        const show = !isLetter || isGuessed || reveal;

        return (
          <motion.span
            key={`${char}-${i}`}
            className={`word-letter ${!isLetter ? "space" : ""} ${
              reveal && !isGuessed && isLetter ? "revealed" : ""
            }`}
            initial={{ rotateY: 0 }}
            animate={show ? { rotateY: [0, -90, 0] } : {}}
            transition={{ duration: 0.4, delay: show ? i * 0.05 : 0 }}
          >
            {show ? char.toUpperCase() : ""}
          </motion.span>
        );
      })}
    </div>
  );
}
