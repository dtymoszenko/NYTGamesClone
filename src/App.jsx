import { Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-[#fffbea] text-gray-800">

      <header className="bg-[#fff176] shadow-md">
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-10 text-center rounded-b-2xl">
          {/* Clickable logo returns to Home */}
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-extrabold mb-1">
              NinaYT
            </h1>
          </Link>
          <p className="text-lg text-gray-700">
            Custom daily games, just for you <span role="img" aria-label="heart">💛</span>
          </p>
        </div>
      </header>

      {/* Main content area */}
      <main className="mt-8 px-4 py-10 max-w-6xl mx-auto">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <GameCard
        icon="🟩"
        title="Wordle"
        description="Guess the 5-letter word in 6 tries."
        color="bg-gray-100"
        to="/wordle"
      />
      <GameCard
        icon="🔷"
        title="Strands"
        description="Find hidden words and uncover the theme."
        color="bg-blue-100"
        to="/strands"
      />
      <GameCard
        icon="✏️"
        title="Crossword"
        description="A classic crossword puzzle."
        color="bg-yellow-100"
        to="/crossword"
      />
    </div>
  );
}

/* ---------- Cards for Games ---------- */
function GameCard({ title, description, color, to, icon }) {
  return (
    <Link
      to={to}
      className={`flex flex-col justify-between rounded-xl shadow-md p-6 hover:shadow-lg transition ${color}`}
    >
      <div>
        <div className="text-5xl mb-4">{icon}</div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm text-gray-700 mt-1">{description}</p>
      </div>

      <button className="mt-6 w-full bg-white rounded-full px-4 py-2 text-sm font-medium shadow hover:bg-gray-100">
        Play
      </button>
    </Link>
  );
}

/* ---------- Links to Games ---------- */
import Wordle from "./Wordle.jsx";
function Strands()  { return <p className="text-center mt-20 text-xl">🔷 Strands game will go here!</p>; }
function Crossword(){ return <p className="text-center mt-20 text-xl">✏️ Crossword game will go here!</p>; }

export default App;
