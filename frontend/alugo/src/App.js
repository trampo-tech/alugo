import './App.css';

function App() {
  return (
    <div>
      <header>
        <div className="logo">Rental Platform</div>
        <div className="buttons">
          <button className="outline">Login</button>
          <button className="outline">Sign up</button>
        </div>
      </header>

      <section className="hero">
        <h1>Rent items from people</h1>
        <div className="search-bar">
          <input type="text" placeholder="Search for items" />
          <button>Search</button>
        </div>
      </section>

      <section className="popular">
        <h2>Popular items</h2>
        <div className="items">
          <div className="card">
            <img src="https://img.icons8.com/ios/100/step-ladder.png" alt="Ladder" />
            <p className="name">Ladder</p>
            <p className="price">$25 <span>/ day</span></p>
          </div>
          <div className="card">
            <img src="https://img.icons8.com/ios/100/virtual-reality.png" alt="VR Headset" />
            <p className="name">VR headset</p>
            <p className="price">$49 <span>/ day</span></p>
          </div>
          <div className="card">
            <img src="https://img.icons8.com/ios/100/guitar.png" alt="Guitar" />
            <p className="name">Acoustic guitar</p>
            <p className="price">$19 <span>/ day</span></p>
          </div>
          <div className="card">
            <img src="https://img.icons8.com/ios/100/suitcase.png" alt="Suitcase" />
            <p className="name">Suitcase</p>
            <p className="price">$49 <span>/ day</span></p>
          </div>
        </div>
      </section>

      <section className="actions">
        <div className="card-action">
          <h3>Become a host</h3>
          <button>Get started</button>
        </div>
        <div className="card-action">
          <h3>How it works</h3>
          <button>Learn more</button>
        </div>
      </section>
    </div>
  );
}

export default App;