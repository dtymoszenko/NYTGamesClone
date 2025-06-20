import { Routes, Route, Link } from "react-router-dom";

function App() {
  {
    /* Adjust gap here in first div to change distance from header */
  }
  return (
    <div className="min-h-screen bg-[#fffbea] text-gray-800 flex flex-col gap-8">
      <header className="w-full bg-[#fff176] shadow-md mb-8 rounded-b-2xl">
        <div className="w-full px-4 pt-6 pb-16 flex flex-col items-center text-center">
          {/* Clickable logo returns to Home */}
          <Link to="/" className="flex items-center justify-center">
            <h1 className="text-4xl font-extrabold mb-1">NinaYT</h1>
          </Link>
          <p className="text-lg text-gray-700">
            <span role="img" aria-label="heart">
              💛
            </span>
            Our Daily Ritual Personalized
            <span role="img" aria-label="heart">
              💛
            </span>
          </p>
        </div>
      </header>

      {/* Main content area */}
      <main className="px-4 pb-10 pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wordle" element={<Wordle />} />
          <Route path="/strands" element={<Strands />} />
          <Route path="/crossword" element={<Crossword />} />
        </Routes>
      </main>
    </div>
  );
}

/* ---------- Game Tiles ---------- */
function Home() {
  return (
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
        description=""
        color="bg-gray-200"
        to="/wordle"
      >
        <button
          type="button"
          className="w-48 h-12 bg-white border border-gray-200 rounded-full shadow-sm text-base font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition flex items-center justify-center"
        >
          Play
        </button>
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
        description=""
        color="bg-teal-200"
        to="/strands"
      >
        <button
          type="button"
          className="w-48 h-12 bg-white border border-gray-200 rounded-full shadow-sm text-base font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition flex items-center justify-center"
        >
          Play
        </button>
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
        description=""
        color="bg-yellow-200"
        to="/crossword"
      >
        <button
          type="button"
          className="w-48 h-12 bg-white border border-gray-200 rounded-full shadow-sm text-base font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition flex items-center justify-center"
        >
          Play
        </button>
      </GameCard>
    </div>
  );
}

/* ---------- Cards for Games ---------- */
function GameCard({ title, description, color, to, icon, children }) {
  return (
    <Link
      to={to}
      className="w-[368px] h-[336px] rounded-2xl bg-white overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col"
    >
      {/* header section */}
      <div
        className={`
          flex flex-col items-center justify-center
          ${color}
          h-[60%]
          rounded-t-2xl
          gap-8
        `}
      >
        <span className="text-5xl">{icon}</span>
        <h2 className="text-3xl font-semibold">{title}</h2>
      </div>

      {/* body section */}
      <div className="px-6 flex flex-col justify-center items-center text-center h-[40%]">
        {description && (
          <p className="text-gray-700 text-sm mb-2">{description}</p>
        )}
        <div className="w-full flex justify-center">{children}</div>
      </div>
    </Link>
  );
}

/* ---------- Links to Games ---------- */
import Wordle from "./Wordle.jsx";
import Strands from "./Strands.jsx";
function Crossword() {
  return (
    <p className="text-center mt-20 text-xl">✏️ Crossword game will go here!</p>
  );
}

export default App;
