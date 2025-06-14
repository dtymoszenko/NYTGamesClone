function App() {
  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>💛NinaYT ☀️</h1>
        <p style={styles.tagline}>☀️Custom NYT💛</p>
      </header>

      <main style={styles.main}>
        <p>Coming soon: Wordle, Strands, and the Big Crossword!</p>
      </main>
    </div>
  );
}

const styles = {
  header: {
    backgroundColor: '#fff176', // Sunny yellow
    padding: '1rem',
    textAlign: 'center',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    margin: 0,
  },
  tagline: {
    fontSize: '1rem',
    marginTop: '0.5rem',
  },
  main: {
    textAlign: 'center',
    fontSize: '1.2rem',
  },
};

export default App;
