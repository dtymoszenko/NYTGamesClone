import { useState } from 'react';

const initialGrid = [
  ['D', 'U', 'P', 'I', 'U', 'I'],
  ['E', 'T', 'E', 'A', 'S', 'T'],
  ['R', 'P', 'N', 'T', 'M', 'E'],
  ['E', 'E', 'O', 'P', 'E', 'I'],
  ['D', 'U', 'L', 'I', 'U', 'N'],
  ['S', 'A', 'C', 'E', 'E', 'N'],
  ['O', 'T', 'E', 'N', 'R', 'U'],
  ['N', 'A', 'S', 'O', 'C', 'T'],
];

export default function Strands() {
  const [selected, setSelected] = useState([]);

  const handleClick = (row, col) => {
    setSelected([...selected, `${row}-${col}`]);
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 pb-10">
      <div className="text-center">
        <p className="text-sm font-semibold text-blue-600">TODAY’S THEME</p>
        <h2 className="text-2xl font-bold mt-1">Key notes</h2>
        <p className="mt-2 text-gray-700 text-sm">0 of X tatheme words found.</p>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {initialGrid.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            const isSelected = selected.includes(key);
            return (
              <button
                key={key}
                onClick={() => handleClick(rowIndex, colIndex)}
                className={`w-14 h-14 text-xl font-bold border rounded-md ${
                  isSelected
                    ? 'bg-yellow-300 border-yellow-500'
                    : 'bg-white border-gray-300 hover:bg-gray-100'
                }`}
              >
                {letter}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
