import { Routes, Route, Link } from "react-router-dom";
import Wordle from "./Wordle.jsx";
import Strands from "./Strands.jsx";
import Mini from "./Mini.jsx";

function App() {
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

      <main className="px-4 pb-10 pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wordle" element={<Wordle />} />
          <Route path="/strands" element={<Strands />} />
          <Route path="/mini" element={<Mini />} />
        </Routes>
      </main>
    </div>
  );
}

function Home() {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Wider progress bar */}
      <div className="w-96 text-center">
        <div className="mb-1 text-base font-medium dark:text-white">
          Finish Games for Secret Message!
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full dark:bg-gray-700">
          <div
            className="h-3 bg-yellow-400 rounded-full dark:bg-blue-500"
            style={{ width: "45%" }}
          />
        </div>
      </div>

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
          color="bg-yellow-200"
          to="/mini"
        >
          <button
            type="button"
            className="w-48 h-12 bg-white border border-gray-200 rounded-full shadow-sm text-base font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition flex items-center justify-center"
          >
            Play
          </button>
        </GameCard>
      </div>
    </div>
  );
}

function GameCard({ title, color, to, icon, children }) {
  return (
    <Link
      to={to}
      className="w-[368px] h-[336px] rounded-2xl bg-white overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col"
    >
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
      <div className="px-6 flex flex-col justify-center items-center text-center h-[40%]">
        <div className="w-full flex justify-center">{children}</div>
      </div>
    </Link>
  );
}

export default App;
