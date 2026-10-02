import { motion } from "framer-motion";

type HangmanFigureProps = {
  wrongCount: number;
  maxWrong: number;
};

const PARTS = [
  "head",
  "body",
  "leftArm",
  "rightArm",
  "leftLeg",
  "rightLeg",
  "face",
] as const;

export function HangmanFigure({ wrongCount, maxWrong }: HangmanFigureProps) {
  const visibleParts = Math.min(wrongCount, PARTS.length);
  const isDead = wrongCount >= maxWrong;

  return (
    <svg
      viewBox="0 0 200 250"
      className="hangman-figure"
      role="img"
      aria-label={`Hangman drawing with ${wrongCount} of ${maxWrong} wrong guesses`}
    >
      {/* Gallows */}
      <motion.g
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* Base */}
        <line x1="20" y1="240" x2="120" y2="240" stroke="var(--gallows)" strokeWidth="6" strokeLinecap="round" />
        {/* Pole */}
        <line x1="50" y1="240" x2="50" y2="20" stroke="var(--gallows)" strokeWidth="6" strokeLinecap="round" />
        {/* Beam */}
        <line x1="50" y1="20" x2="140" y2="20" stroke="var(--gallows)" strokeWidth="6" strokeLinecap="round" />
        {/* Support diagonal */}
        <line x1="50" y1="50" x2="80" y2="20" stroke="var(--gallows)" strokeWidth="4" strokeLinecap="round" />
        {/* Rope */}
        <line x1="140" y1="20" x2="140" y2="45" stroke="var(--rope)" strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* Head */}
      {visibleParts >= 1 && (
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "backOut" }}
          style={{ transformOrigin: "140px 65px" }}
        >
          <circle cx="140" cy="65" r="20" stroke="var(--figure)" strokeWidth="4" fill="none" />
        </motion.g>
      )}

      {/* Face (drawn when dead) */}
      {visibleParts >= 7 && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* X eyes */}
          <line x1="132" y1="60" x2="138" y2="66" stroke="var(--figure)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="138" y1="60" x2="132" y2="66" stroke="var(--figure)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="142" y1="60" x2="148" y2="66" stroke="var(--figure)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="148" y1="60" x2="142" y2="66" stroke="var(--figure)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Sad mouth */}
          <path d="M132 76 Q140 70 148 76" stroke="var(--figure)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </motion.g>
      )}

      {/* Body */}
      {visibleParts >= 2 && (
        <motion.line
          x1="140"
          y1="85"
          x2="140"
          y2="155"
          stroke="var(--figure)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      )}

      {/* Left arm */}
      {visibleParts >= 3 && (
        <motion.line
          x1="140"
          y1="100"
          x2="110"
          y2="125"
          stroke="var(--figure)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      )}

      {/* Right arm */}
      {visibleParts >= 4 && (
        <motion.line
          x1="140"
          y1="100"
          x2="170"
          y2="125"
          stroke="var(--figure)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      )}

      {/* Left leg */}
      {visibleParts >= 5 && (
        <motion.line
          x1="140"
          y1="155"
          x2="115"
          y2="195"
          stroke="var(--figure)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      )}

      {/* Right leg */}
      {visibleParts >= 6 && (
        <motion.line
          x1="140"
          y1="155"
          x2="165"
          y2="195"
          stroke="var(--figure)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      )}

      {/* Swing animation when dead */}
      {isDead && visibleParts >= 6 && (
        <motion.g
          animate={{ rotate: [0, 3, -3, 2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "140px 20px" }}
        >
        </motion.g>
      )}
    </svg>
  );
}
