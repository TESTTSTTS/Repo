import React from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiMail } from 'react-icons/fi';

const Footer = () => {
  const socialLinks = [
    {
      icon: <FiGithub />,
      href: "https://github.com/BloodyNQ",
      label: "GitHub"
    },
    {
      icon: <FiMail />,
      href: "mailto:nersesq2003@gmail.com",
      label: "Email"
    }
  ];

  return (
    <footer className="bg-dark py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Левая колонка */}
            <div className="text-center md:text-left">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-light mb-4"
              >
                Let's Connect
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-400 mb-6"
              >
                Feel free to reach out for collaborations or just a friendly hello
              </motion.p>
              <div className="flex justify-center md:justify-start gap-4">
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    {link.icon}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Правая колонка */}
            <div className="text-center md:text-right">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <p className="text-light">Nerses Kalashyan</p>
                <p className="text-gray-400">Armenia, Ejmiatsin</p>
                <p className="text-gray-400">+374 55 444822</p>
                <p className="text-gray-400">nersesq2003@gmail.com</p>
              </motion.div>
            </div>
          </div>

          {/* Копирайт */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12 pt-8 border-t border-primary/10"
          >
            <p className="text-gray-400">
              © {new Date().getFullYear()} Nerses Kalashyan. All rights reserved.
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 