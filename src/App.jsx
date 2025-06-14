import { Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-[#fffbea] text-gray-800 px-6 py-10">
      <header className="bg-[#fff176] p-6 rounded-2xl shadow-lg text-center mb-12">
        <h1 className="text-3xl font-semibold">NinaYT ☀️</h1>
        <p className="mt-2 text-base text-gray-700">Custom daily games, just for you 💛</p>

        <nav className="mt-4 flex justify-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/wordle" className="hover:underline">Wordle</Link>
          <Link to="/strands" className="hover:underline">Strands</Link>
          <Link to="/crossword" className="hover:underline">Crossword</Link>
        </nav>
      </header>

      <main className="text-center text-lg">
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

function Home() {
  return <p>Coming soon: Wordle, Strands, and the Big Crossword!</p>;
}

function Wordle() {
  return <p>Wordle game will go here!</p>;
}

function Strands() {
  return <p>Strands game will go here!</p>;
}

function Crossword() {
  return <p>Crossword game will go here!</p>;
}

export default App;
