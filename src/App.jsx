import { Routes, Route, Link } from 'react-router-dom';

function App() {
  {/* Adjust gap here in first div to change distance from header */}
  return (
    <div className="min-h-screen bg-[#fffbea] text-gray-800 flex flex-col gap-8">

      <header className="bg-[#fff176] shadow-md mb-8">
        <div className="w-full px-4 pt-6 pb-16 flex flex-col items-center text-center rounded-b-2xl">
          {/* Clickable logo returns to Home */}
          <Link to="/" className="w-full flex justify-center">
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
        icon="🟩"
        title="Wordle"
        description="Guess the 5-letter word in 6 tries!"
        color="bg-gray-200"
        to="/wordle"
      />
      <GameCard
        icon="🔷"
        title="Strands"
        description="Solve the Hidden Theme!"
        color="bg-teal-200"
        to="/strands"
      />
      <GameCard
        icon="✏️"
        title="Crossword"
        description="Solve the mini puzzle of the day!"
        color="bg-yellow-200"
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
      className="w-[368px] h-[336px] rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col"
    >
      {/* header section */}
      <div className={`flex flex-col items-center justify-center ${color} py-8`}>
        <span className="text-5xl">{icon}</span>
        <h2 className="mt-2 text-2xl font-bold">{title}</h2>
      </div>

      {/* body section */}
      <div className="bg-white px-6 pt-4 pb-6 flex flex-col justify-between flex-grow text-center">
        <p className="text-gray-700 text-sm">{description}</p>
        <button className="mt-4 px-6 py-2 rounded-full bg-white border border-gray-300 font-medium hover:bg-gray-100">
          Play
        </button>
      </div>
    </Link>
  );
}


/* ---------- Links to Games ---------- */
import Wordle from "./Wordle.jsx";
import Strands from './Strands.jsx';
function Crossword(){ return <p className="text-center mt-20 text-xl">✏️ Crossword game will go here!</p>; }

export default App;
