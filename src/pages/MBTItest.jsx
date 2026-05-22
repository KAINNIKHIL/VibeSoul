import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    question: "At a party, you usually...",
    options: [
      { text: "Talk with lots of people", trait: "E" },
      { text: "Stay with a few close people", trait: "I" },
    ],
  },
  {
    question: "You trust more...",
    options: [
      { text: "Facts and experience", trait: "S" },
      { text: "Ideas and possibilities", trait: "N" },
    ],
  },
  {
    question: "When making decisions...",
    options: [
      { text: "You follow logic", trait: "T" },
      { text: "You follow your heart", trait: "F" },
    ],
  },
  {
    question: "Your lifestyle is more...",
    options: [
      { text: "Planned and organized", trait: "J" },
      { text: "Flexible and spontaneous", trait: "P" },
    ],
  },
  {
    question: "Your ideal weekend is...",
    options: [
      { text: "Going out and socializing", trait: "E" },
      { text: "Relaxing alone or with close friends", trait: "I" },
    ],
  },
  {
    question: "You notice first...",
    options: [
      { text: "What’s happening now", trait: "S" },
      { text: "What could happen next", trait: "N" },
    ],
  },
  {
    question: "Friends describe you as...",
    options: [
      { text: "Rational and objective", trait: "T" },
      { text: "Warm and understanding", trait: "F" },
    ],
  },
  {
    question: "When traveling, you prefer...",
    options: [
      { text: "A planned itinerary", trait: "J" },
      { text: "Exploring freely", trait: "P" },
    ],
  },
];

export default function MBTITest() {
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState({
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // fake loader (gives smooth UX like real apps)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  const handleAnswer = (trait) => {
    const updated = { ...scores, [trait]: scores[trait] + 1 };
    setScores(updated);

    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      const mbti =
        (updated.E >= updated.I ? "E" : "I") +
        (updated.S >= updated.N ? "S" : "N") +
        (updated.T >= updated.F ? "T" : "F") +
        (updated.J >= updated.P ? "J" : "P");

      setResult(mbti);
    }
  };

  const handleSave = () => {
    localStorage.setItem("mbtiResult", result);
    navigate("/edit-profile");
  };

  // ---------------- SKELETON ----------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center px-4">

        <div className="w-full max-w-2xl space-y-6 animate-pulse">

          {/* card */}
          <div className="h-10 bg-white/10 rounded-xl w-1/2" />

          {/* question */}
          <div className="h-6 bg-white/10 rounded-lg w-full" />
          <div className="h-6 bg-white/10 rounded-lg w-3/4" />

          {/* options */}
          <div className="space-y-3 mt-6">
            <div className="h-14 bg-white/10 rounded-2xl" />
            <div className="h-14 bg-white/10 rounded-2xl" />
            <div className="h-14 bg-white/10 rounded-2xl" />
            <div className="h-14 bg-white/10 rounded-2xl" />
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="
      min-h-screen
      bg-[#0b1120]
      text-white
      flex
      items-center
      justify-center
      px-4
      py-10
    ">

      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[-100px] w-[320px] h-[320px] bg-pink-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-[-120px] right-[-100px] w-[320px] h-[320px] bg-violet-500/20 blur-3xl rounded-full" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-2xl bg-white/[0.05] backdrop-blur-2xl border border-white/10 rounded-3xl p-8">

        {!result ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between mb-3">
                <h2 className="text-2xl font-bold">MBTI Soul Test ✨</h2>
                <span className="text-sm text-gray-400">
                  {currentQ + 1}/{questions.length}
                </span>
              </div>

              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-violet-500"
                  style={{
                    width: `${((currentQ + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question */}
            <h3 className="text-3xl font-bold mb-8">
              {questions[currentQ].question}
            </h3>

            {/* Options */}
            <div className="grid gap-4">
              {questions[currentQ].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt.trait)}
                  className="
                    p-5
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.05]
                    text-left
                    hover:bg-white/[0.08]
                    transition
                  "
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center">

            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-4xl font-bold mb-6">
              {result}
            </div>

            <h2 className="text-4xl font-bold mb-4">
              You are {result}
            </h2>

            <button
              onClick={handleSave}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl"
            >
              Save Personality
            </button>

          </div>
        )}

      </div>
    </div>
  );
}