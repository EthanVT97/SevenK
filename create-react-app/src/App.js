import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My Project</h1>
        <nav className="main-nav">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>
      </header>
      <main className="App-main">
        <section className="content-section">
          <h2>Getting Started</h2>
          <p>This is your new React project. Start building amazing things!</p>
        </section>
      </main>
      <footer className="App-footer">
        <p>&copy; 2024 My Project. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
