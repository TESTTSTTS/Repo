import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Stats from './components/Stats';
import Portfolio from './components/Portfolio';
import FAQ from './components/FAQ';
import NewsFeeds from './components/NewsFeeds';
import Footer from './components/Footer';
import NavigationIcons from './components/NavigationIcons';
import Experience from './components/Experience';

function App() {
  return (
    <div className="min-h-screen bg-dark text-light">
      <Header />
      <NavigationIcons />
      <main className="overflow-hidden">
        <section id="home">
          <Hero />
        </section>
        <section id="services">
          <Services />
        </section>
        <Stats />
        <section id="works">
          <Portfolio />
        </section>
        <FAQ />
        <section id="news">
          <NewsFeeds />
        </section>
        <Experience />
      </main>
      <section id="contact">
        <Footer />
      </section>
    </div>
  );
}

export default App; 