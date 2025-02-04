import React from 'react';
import Logo from './Logo';

const Header = () => {
  return (
    <header className="bg-dark py-4">
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center">
          <Logo />
          <ul className="flex space-x-6">
            <li><a href="#home" className="text-light hover:text-primary">Home</a></li>
            <li><a href="#services" className="text-light hover:text-primary">Services</a></li>
            <li><a href="#works" className="text-light hover:text-primary">Works</a></li>
            <li><a href="#contact" className="text-light hover:text-primary">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 