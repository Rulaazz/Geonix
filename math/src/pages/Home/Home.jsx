import React from 'react';
import logo from './GeonixIcon.png'; // Adjust the path as necessary
import './Home.css';

function Home() {
  return (
    <div className="text-center p-6">
       <img src={logo} className="App-logo" alt="logo" />
      <h1 className="text-3xl font-bold mb-4">Welcome to Geonix Math Practice!</h1>
      <p className="text-xl">Start practicing your math skills today.</p>
    </div>
  );
}

export default Home;
