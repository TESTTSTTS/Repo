import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome,          // Домашняя страница
  FiLayers,        // Сервисы/Услуги
  FiBriefcase,     // Портфолио/Работы
  FiHelpCircle,    // FAQ/Вопросы
  FiBell,          // Новости/Обновления
  FiBarChart2,     // Профессиональные навыки
  FiMenu, FiX
} from 'react-icons/fi';

const NavigationIcons = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "#home", icon: <FiHome className="w-6 h-6" />, label: "Home" },
    { href: "#services", icon: <FiLayers className="w-6 h-6" />, label: "Services" },
    { href: "#skills", icon: <FiBarChart2 className="w-6 h-6" />, label: "Skills" },
    { href: "#works", icon: <FiBriefcase className="w-6 h-6" />, label: "Works" },
    { href: "#faq", icon: <FiHelpCircle className="w-6 h-6" />, label: "FAQ" },
    { href: "#news", icon: <FiBell className="w-6 h-6" />, label: "News" }
  ];

  const handleClick = (href) => {
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
      }
    }, 100);
  };

  return (
    <>
      {/* Мобильная кнопка меню */}
      <motion.button
        className="fixed right-6 top-6 z-50 w-14 h-14 bg-primary/20 backdrop-blur-sm rounded-xl flex md:hidden items-center justify-center border-2 border-primary/30"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isMenuOpen ? 
          <FiX className="w-6 h-6 text-white" /> : 
          <FiMenu className="w-6 h-6 text-white" />
        }
      </motion.button>

      {/* Мобильное меню */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-0 z-40 md:hidden bg-dark/95 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-6 pt-20">
              {navItems.map((item, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleClick(item.href)}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 px-6 py-4 w-full hover:bg-primary/20"
                >
                  <div className="text-white">{item.icon}</div>
                  <span className="text-white text-lg">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Десктопная навигация */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:block">
        <div className="flex flex-col space-y-4">
          {navItems.map((item, index) => (
            <motion.button
              key={index}
              onClick={() => handleClick(item.href)}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group relative w-14 h-14 bg-primary/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-primary/30 transition-all duration-300 border-2 border-primary/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="text-white group-hover:text-white/90 transition-colors duration-300">
                {item.icon}
              </div>
              
              {/* Всплывающая подсказка */}
              <div className="absolute right-full mr-3 px-3 py-2 bg-primary/20 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap border border-primary/30">
                {item.label}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </>
  );
};

export default NavigationIcons; 