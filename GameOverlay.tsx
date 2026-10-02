import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Trophy, Skull } from "lucide-react";

type GameOverlayProps = {
  result: "win" | "lose" | null;
  word: string;
  category: string;
  onPlayAgain: () => void;
};

export function GameOverlay({ result, word, category, onPlayAgain }: GameOverlayProps) {
  return (
    <AnimatePresence>
      {result && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`overlay-card ${result}`}
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="overlay-icon">
              {result === "win" ? (
                <Trophy size={56} strokeWidth={2} />
              ) : (
                <Skull size={56} strokeWidth={2} />
              )}
            </div>
            <h2 className="overlay-title">
              {result === "win" ? "You Win!" : "Game Over"}
            </h2>
            <p className="overlay-word">
              The word was: <strong>{word.toUpperCase()}</strong>
            </p>
            <p className="overlay-category">Category: {category}</p>
            <motion.button
              className="overlay-button"
              onClick={onPlayAgain}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={20} />
              Play Again
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
