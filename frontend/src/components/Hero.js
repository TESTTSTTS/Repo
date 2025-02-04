import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center relative overflow-hidden">
      {/* Фоновый градиент */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5" />
      
      <div className="container mx-auto px-4 pt-20 md:pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-light">Nerses</span>
              <span className="text-light block mt-2 md:mt-0 md:inline"> Kalashyan</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl mb-8">
              DevOps Engineer & Mobile Developer
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.a
                href="#contact"
                className="btn-primary px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-base md:text-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Contact Me
              </motion.a>
              <motion.a
                href="#works"
                className="btn-secondary px-8 py-4 border border-primary/20 text-light rounded-full hover:border-primary/40 transition-colors text-base md:text-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#works').scrollIntoView({ behavior: 'smooth' });
                }}
              >
                My Projects
              </motion.a>
            </div>
          </motion.div>

          {/* Правая часть с изображением */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="hidden lg:block relative"
          >
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#1a1f24] p-4">
              <img 
                src="/images/resume-preview.svg"
                alt="Resume Preview" 
                className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-500"
              />
              
              {/* Декоративные элементы */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark/50 to-transparent pointer-events-none" />
              <div className="absolute -inset-2 border border-primary/20 rounded-2xl pointer-events-none" />
              
              {/* Блюр эффекты */}
              <div className="absolute top-4 right-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Плавающие элементы */}
            <motion.div
              className="absolute -top-8 -right-8 w-20 h-20 bg-primary/10 rounded-lg"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-8 -left-8 w-20 h-20 bg-primary/10 rounded-lg"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 