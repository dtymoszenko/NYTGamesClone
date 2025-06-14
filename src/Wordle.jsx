export default function Wordle() {
  return (
    <div className="flex flex-col items-center gap-2 mt-10">
      {[...Array(6)].map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-2">
          {[...Array(5)].map((_, colIndex) => (
            <div
              key={colIndex}
              className="w-12 h-12 border-2 border-gray-300 rounded-md bg-white flex items-center justify-center text-xl font-bold"
            >
              {/* Letter placeholder */}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
