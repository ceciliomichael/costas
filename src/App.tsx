import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import Rooms from './components/Rooms';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <Gallery />
        <Rooms />
        <About />
        <Contact />
        <Footer />
      </main>
    </div>
  );
};

export default App;
