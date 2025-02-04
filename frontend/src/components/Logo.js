import React from 'react';
import { motion } from 'framer-motion';

const Logo = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center space-x-3"
    >
      <div className="relative w-12 h-12">
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 1.5 }}
        >
          {/* Убираем декоративные линии и делаем более стильный шестиугольник */}
          <motion.path
            d="M50 5 L85 25 L85 75 L50 95 L15 75 L15 25 Z"
            className="fill-dark stroke-primary"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5 }}
          />
          
          {/* Делаем букву N более стильной */}
          <motion.path
            d="M35 70 V30 L65 70 V30"
            className="fill-none stroke-primary"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
          />
        </motion.svg>
      </div>
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col"
      >
        <span className="text-2xl font-bold text-primary tracking-wider">
          NERSES
        </span>
        <span className="text-xs text-gray-400 tracking-widest uppercase">
          Developer
        </span>
      </motion.div>
    </motion.div>
  );
};

export default Logo; 