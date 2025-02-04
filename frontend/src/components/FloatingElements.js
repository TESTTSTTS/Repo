import React from 'react';
import { motion } from 'framer-motion';

const FloatingElements = () => {
  return (
    <>
      <motion.div
        className="absolute -top-8 -right-8 w-20 h-20 bg-primary/10 rounded-lg"
        animate={{ 
          y: [0, 10, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute -bottom-8 -left-8 w-20 h-20 bg-primary/10 rounded-lg"
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </>
  );
};

export default FloatingElements; 