import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Gallery from '../components/Gallery';
import Rooms from '../components/Rooms';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Gallery />
        <Rooms />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default Home; 