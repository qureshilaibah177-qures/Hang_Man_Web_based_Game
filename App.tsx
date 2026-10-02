import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Volume2, VolumeX, Moon, Sun } from "lucide-react";
import { HangmanFigure } from "./components/HangmanFigure";
import { WordDisplay } from "./components/WordDisplay";
import { Keyboard } from "./components/Keyboard";
import { GameOverlay } from "./components/GameOverlay";
import { StatsPanel } from "./components/StatsPanel";
import { useSound } from "./hooks/useSound";
import { supabase, type HangmanWord, type Difficulty } from "./lib/supabase";

const MAX_WRONG = 6;

type GameState = "playing" | "won" | "lost";

type GameData = {
  word: string;
  category: string;
  difficulty: string;
};

export default function App() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("any");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [statsKey, setStatsKey] = useState(0);
  const [saving, setSaving] = useState(false);

  const play = useSound(soundEnabled);

  const fetchWord = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from("hangman_words").select("*");
      if (difficulty !== "any") {
        query = query.eq("difficulty", difficulty);
      }

      const { data, error: fetchError } = await query;

      if (fetchError || !data || data.length === 0) {
        setError("Could not load words. Please try again.");
        setLoading(false);
        return;
      }

      const words = data as HangmanWord[];
      const random = words[Math.floor(Math.random() * words.length)];

      setGameData({
        word: random.word.toLowerCase(),
        category: random.category,
        difficulty: random.difficulty,
      });
      setGuessedLetters(new Set());
      setWrongCount(0);
      setHintsUsed(0);
      setGameState("playing");
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }, [difficulty]);

  useEffect(() => {
    fetchWord();
  }, [fetchWord]);

  const saveResult = useCallback(
    async (won: boolean, word: string, category: string, wrongs: number, hints: number) => {
      setSaving(true);
      try {
        await supabase.from("hangman_results").insert({
          word,
          category,
          won,
          wrong_guesses: wrongs,
          hints_used: hints,
        });
      } catch {
        // Silent fail — stats are best-effort
      } finally {
        setSaving(false);
        setStatsKey((k) => k + 1);
      }
    },
    []
  );

  const handleGuess = useCallback(
    (letter: string) => {
      if (gameState !== "playing" || !gameData) return;
      if (guessedLetters.has(letter)) return;

      const newGuessed = new Set(guessedLetters);
      newGuessed.add(letter);
      setGuessedLetters(newGuessed);

      if (gameData.word.includes(letter)) {
        play("correct");

        const allLettersGuessed = gameData.word
          .split("")
          .every((c) => !/[a-z]/.test(c) || newGuessed.has(c));

        if (allLettersGuessed) {
          setGameState("won");
          play("win");
          saveResult(true, gameData.word, gameData.category, wrongCount, hintsUsed);
        }
      } else {
        const newWrong = wrongCount + 1;
        setWrongCount(newWrong);
        play("wrong");

        if (newWrong >= MAX_WRONG) {
          setGameState("lost");
          play("lose");
          saveResult(false, gameData.word, gameData.category, newWrong, hintsUsed);
        }
      }
    },
    [gameState, gameData, guessedLetters, wrongCount, hintsUsed, play, saveResult]
  );

  const handleHint = useCallback(() => {
    if (gameState !== "playing" || !gameData) return;

    const unguessedLetters = gameData.word
      .split("")
      .filter((c) => /[a-z]/.test(c) && !guessedLetters.has(c));

    if (unguessedLetters.length === 0) return;

    const randomLetter =
      unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(randomLetter);
    setGuessedLetters(newGuessed);
    setHintsUsed((h) => h + 1);
    play("hint");

    const allLettersGuessed = gameData.word
      .split("")
      .every((c) => !/[a-z]/.test(c) || newGuessed.has(c));

    if (allLettersGuessed) {
      setGameState("won");
      play("win");
      saveResult(true, gameData.word, gameData.category, wrongCount, hintsUsed + 1);
    }
  }, [gameState, gameData, guessedLetters, wrongCount, hintsUsed, play, saveResult]);

  const handlePlayAgain = useCallback(() => {
    fetchWord();
  }, [fetchWord]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;
      const key = e.key.toLowerCase();
      if (/^[a-z]$/.test(key)) {
        handleGuess(key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, handleGuess]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const livesLeft = MAX_WRONG - wrongCount;

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1 className="logo">
            <span className="logo-icon">🎯</span>
            Hangman
          </h1>
          <span className="tagline">Guess the word before it's too late</span>
        </div>
        <div className="header-right">
          <button
            className="icon-button"
            onClick={() => setSoundEnabled((s) => !s)}
            aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button
            className="icon-button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="main">
        <section className="game-section">
          {error && (
            <div className="error-banner">
              {error}
              <button onClick={fetchWord} className="retry-button">
                Retry
              </button>
            </div>
          )}

          {loading && (
            <div className="loading-screen">
              <motion.div
                className="loading-spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p>Loading game…</p>
            </div>
          )}

          {!loading && gameData && (
            <>
              <div className="game-info-bar">
                <div className="info-chip">
                  <span className="info-label">Category</span>
                  <span className="info-value">{gameData.category}</span>
                </div>
                <div className="info-chip">
                  <span className="info-label">Difficulty</span>
                  <span className="info-value">{gameData.difficulty}</span>
                </div>
                <div className={`info-chip ${livesLeft <= 2 ? "danger" : ""}`}>
                  <span className="info-label">Lives Left</span>
                  <span className="info-value">
                    {"❤".repeat(livesLeft)}
                    {"🖤".repeat(MAX_WRONG - livesLeft)}
                  </span>
                </div>
                <div className="info-chip">
                  <span className="info-label">Hints Used</span>
                  <span className="info-value">{hintsUsed}</span>
                </div>
              </div>

              <div className="game-board">
                <div className="figure-area">
                  <HangmanFigure wrongCount={wrongCount} maxWrong={MAX_WRONG} />
                </div>

                <div className="play-area">
                  <WordDisplay
                    word={gameData.word}
                    guessedLetters={guessedLetters}
                    reveal={gameState === "lost"}
                  />

                  <div className="hint-row">
                    <motion.button
                      className="hint-button"
                      onClick={handleHint}
                      disabled={gameState !== "playing"}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Lightbulb size={18} />
                      Reveal a Letter
                    </motion.button>
                  </div>

                  <Keyboard
                    guessedLetters={guessedLetters}
                    word={gameData.word}
                    disabled={gameState !== "playing"}
                    onGuess={handleGuess}
                  />
                </div>
              </div>

              <GameOverlay
                result={gameState === "won" ? "win" : gameState === "lost" ? "lose" : null}
                word={gameData.word}
                category={gameData.category}
                onPlayAgain={handlePlayAgain}
              />
            </>
          )}

          <div className="difficulty-selector">
            <span className="difficulty-label">Difficulty:</span>
            {(["any", "easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                className={`diff-button ${difficulty === d ? "active" : ""}`}
                onClick={() => setDifficulty(d)}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
          {saving && <div className="saving-indicator">Saving score…</div>}
        </section>

        <aside className="stats-section">
          <StatsPanel refreshKey={statsKey} />
        </aside>
      </main>

      <footer className="footer">
        <p>Built with React, Supabase & Framer Motion</p>
      </footer>
    </div>
  );
}
