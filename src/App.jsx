import { Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Wordle from "./Wordle.jsx";
import Strands from "./Strands.jsx";
import Mini from "./Mini.jsx";

/* -------------------------------------------------------- */
/*  Hook: read / update persistent progress from localStorage
/* -------------------------------------------------------- */
function useProgress() {
  const [progress, setProgress] = useState(0);
  const games = ["wordle", "strands", "mini"];

  const calcProgress = () => {
    try {
      const store = JSON.parse(localStorage.getItem("gameProgress") || "{}");
      const completed = games.filter((g) => store[g] === true).length;
      return completed / games.length;
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    setProgress(calcProgress());
    const handler = () => setProgress(calcProgress());
    window.addEventListener("gameCompleted", handler);
    return () => window.removeEventListener("gameCompleted", handler);
  }, []);

  return progress; // 0–1
}

/* ---------------------- */
/*       MAIN APP         */
/* ---------------------- */
function App() {
  const [showSecret, setShowSecret] = useState(false);

  return (
    <div className="min-h-screen bg-[#fffbea] text-gray-800 flex flex-col gap-8">
      <header className="w-full bg-[#fff176] shadow-md mb-8 rounded-b-2xl">
        <div className="w-full px-4 pt-6 pb-16 flex flex-col items-center text-center">
          <Link to="/" className="flex items-center justify-center">
            <h1 className="text-4xl font-extrabold mb-1">NinaYT</h1>
          </Link>
          <p className="text-lg text-gray-700">
            <span role="img" aria-label="heart">
              💛
            </span>{" "}
            Our Daily Ritual, Personalized!
            <span role="img" aria-label="heart">
              💛
            </span>
          </p>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Home showSecret={showSecret} setShowSecret={setShowSecret} />
            }
          />
          <Route path="/wordle" element={<Wordle />} />
          <Route path="/strands" element={<Strands />} />
          <Route path="/mini" element={<Mini />} />
        </Routes>
      </main>
    </div>
  );
}

/* ---------------------- */
/*       HOME PAGE        */
/* ---------------------- */
function Home({ showSecret, setShowSecret }) {
  const progress = useProgress();
  const pct = Math.round(progress * 100);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress Bar */}
      <div className="w-96 text-center">
        <div className="text-sm font-semibold text-gray-600 mb-1">
          {`${Math.floor(progress * 3)}/3 Games Completed`}
        </div>
        <div className="mb-1 text-base font-medium dark:text-white">
          {pct === 100
            ? "COMPLETED ✅"
            : `Finish Games for Secret Message! (${pct}%)`}
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full dark:bg-gray-700">
          <div
            className="h-3 bg-yellow-400 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Secret Message Button */}
      <button
        onClick={() => setShowSecret(true)}
        type="button"
        className={`w-48 h-12 mt-4 border rounded-full shadow-sm text-base font-medium transition
          ${
            pct === 100
              ? "bg-yellow-400 text-white border-yellow-500 hover:brightness-105 cursor-pointer"
              : "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
          }`}
        disabled={pct !== 100}
      >
        Secret Message
      </button>

      {/* Modal */}
      {showSecret && (
        <div className="fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center space-y-4 border border-yellow-400">
            <h2 className="text-2xl font-bold text-yellow-500">
              💛 Secret Message 💛
            </h2>
            <p className="text-gray-800">
              I love you Nina!!! You are the best thing that has ever happened
              to me, and my favorite part of everyday.
              <br />
              <br />I hope you enjoyed NinaYT and it was worth the wait.
              <br />
              P.S. I want to write a lot more but I'm boarding the plane... Cya
              soon!
            </p>
            <button
              onClick={() => setShowSecret(false)}
              className="w-full bg-yellow-400 text-white py-2 rounded-lg shadow hover:brightness-105"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Game Cards */}
      <div className="flex justify-center flex-wrap gap-6">
        <GameCard
          icon={
            <img
              src="/NYTWordleRecoloredLogo.png"
              alt="Wordle Logo"
              className="h-20 w-20 object-contain"
            />
          }
          title="Wordle"
          color="bg-gray-300"
          to="/wordle"
        >
          <PlayBtn />
        </GameCard>

        <GameCard
          icon={
            <img
              src="/NYTStrandsLogo.png"
              alt="Strands Logo"
              className="h-20 w-20 object-contain"
            />
          }
          title="Strands"
          color="bg-teal-200"
          to="/strands"
        >
          <PlayBtn />
        </GameCard>

        <GameCard
          icon={
            <img
              src="/NYTMiniLogo.png"
              alt="Mini Crossword Logo"
              className="h-20 w-20 object-contain"
            />
          }
          title="The Mini"
          color="bg-orange-200"
          to="/mini"
        >
          <PlayBtn />
        </GameCard>
      </div>
    </div>
  );
}

/* ------------- */
/*  SUB-COMPONENTS
/* ------------- */

function PlayBtn() {
  return (
    <button
      type="button"
      className="w-48 h-12 bg-white border border-gray-200 rounded-full shadow-sm text-base font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
    >
      Play
    </button>
  );
}

function GameCard({ icon, title, color, to, children }) {
  return (
    <Link
      to={to}
      className="w-[368px] h-[336px] rounded-2xl bg-white overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col"
    >
      <div
        className={`flex flex-col items-center justify-center ${color} h-[60%] rounded-t-2xl gap-8`}
      >
        <span className="text-5xl">{icon}</span>
        <h2 className="text-3xl font-semibold">{title}</h2>
      </div>
      <div className="px-6 flex flex-col justify-center items-center text-center h-[40%]">
        <div className="w-full flex justify-center">{children}</div>
      </div>
    </Link>
  );
}

export default App;
