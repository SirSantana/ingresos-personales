"use client";
import { useEffect, useState, useRef } from "react";

// Datos del quiz (imágenes en /public/parts/)
const PARTS = [
  {
    id: 1,
    name: "Turbo",
    image: "/logos/facebook.png",
    options: ["Radiador", "Turbo", "Alternador", "Bomba de agua"],
  },
  {
    id: 2,
    name: "Bujía",
    image: "/logos/tiktok.png",
    options: ["Bujía", "Inyector", "Sensor O2", "Válvula EGR"],
  },
  // Añade más piezas...
];

export default function EngineQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCorrect = useRef<HTMLAudioElement>(new Audio("/sounds/correct.mp3"));
  const audioWrong = useRef<HTMLAudioElement>(new Audio("/sounds/wrong.mp3"));
  const audioTick = useRef<HTMLAudioElement>(new Audio("/sounds/tick.mp3"));

  // Configuración del confeti
  const confettiConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 70,
    dragFriction: 0.12,
    duration: 3000,
    stagger: 3,
    colors: ["#EF4444", "#F59E0B", "#10B981", "#3B82F6"],
  };

  // Temporizador
  useEffect(() => {
    if (timeLeft > 0 && !gameOver && selected === null) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAnswer("");
            return 0;
          }
          audioTick.current.play();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current as NodeJS.Timeout);
  }, [timeLeft, gameOver, selected]);

  // Manejar respuesta
  const handleAnswer = (answer: string) => {
    clearInterval(timerRef.current as NodeJS.Timeout);
    setSelected(answer);

    const correct = answer === PARTS[currentQuestion].name;
    if (correct) {
      setScore(score + 10 + timeLeft * 2); // Bonus por velocidad
      audioCorrect.current.play();
    } else {
      audioWrong.current.play();
    }
    setIsCorrect(correct);

    // Siguiente pregunta o fin del juego
    setTimeout(() => {
      if (currentQuestion < PARTS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(10);
        setSelected(null);
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  // Reiniciar juego
  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(10);
    setGameOver(false);
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-md bg-gray-800 rounded-t-xl p-4 border-b border-yellow-500">
        <h1 className="text-2xl font-bold text-center text-yellow-400">
          🚗 Engine Quiz: ¿Qué parte es?
        </h1>
        <div className="flex justify-between mt-4">
          <span className="font-mono bg-gray-700 px-3 py-1 rounded">
            Puntos: {score}
          </span>
          <span
            className={`font-mono px-3 py-1 rounded ${
              timeLeft < 5 ? "bg-red-600 animate-pulse" : "bg-blue-600"
            }`}
          >
            ⏱️ {timeLeft}s
          </span>
        </div>
      </div>

      {/* Contenedor del juego */}
      <div className="w-full max-w-md bg-gray-800 rounded-b-xl p-6">
        {!gameOver ? (
          <>
            {/* Imagen de la pieza */}
            <div className="relative group">
              <img
                src={PARTS[currentQuestion].image}
                alt="Parte de motor"
                className="w-full h-48 object-contain mb-6 rounded-lg border-2 border-gray-600 group-hover:border-yellow-500 transition-all"
              />
              <div className="absolute inset-0 bg-yellow-500 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity" />
            </div>

            {/* Opciones */}
            <div className="grid grid-cols-2 gap-3">
              {PARTS[currentQuestion].options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={selected !== null}
                  className={`p-3 rounded-lg font-medium transition-all ${
                    selected === option
                      ? option === PARTS[currentQuestion].name
                        ? "bg-green-600 scale-105"
                        : "bg-red-600 scale-105"
                      : "bg-gray-700 hover:bg-gray-600"
                  } ${
                    selected !== null &&
                    option === PARTS[currentQuestion].name &&
                    "ring-4 ring-yellow-500"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Feedback */}
            {selected && (
              <div className="mt-4 text-center">
                {/* <Confetti active={isCorrect || false} config={confettiConfig} /> */}
                <p
                  className={`text-xl font-bold ${
                    isCorrect ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {isCorrect ? "¡Correcto! 🎉" : "¡Oops! Era: " + PARTS[currentQuestion].name}
                </p>
              </div>
            )}
          </>
        ) : (
          /* Pantalla de resultados */
          <div className="text-center">
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">
              {score >= 50 ? "¡Eres un mecánico experto! 🔧" : "¡Sigue practicando! 🛠️"}
            </h2>
            <p className="text-2xl mb-6">Puntuación final: {score}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetGame}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Jugar otra vez
              </button>
              <button
                onClick={() =>
                  alert(
                    `¡Obtuve ${score} puntos en #EngineQuiz! ¿Podrás superarme?`
                  )
                }
                className="bg-blue-500 hover:bg-blue-600 font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Compartir
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Créditos (opcional) */}
      <p className="mt-8 text-gray-400 text-sm text-center">
        Desliza para la siguiente pregunta. ¡Perfecto para Reels! 🎥
      </p>
    </div>
  );
}