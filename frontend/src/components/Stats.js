import React from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiServer, FiSmartphone, FiDatabase } from 'react-icons/fi';

const Stats = () => {
  const stats = [
    { 
      value: "85%", 
      label: "DevOps", 
      color: "#3AAFA9",
      icon: <FiServer className="w-6 h-6" />
    },
    { 
      value: "82%", 
      label: "Unity", 
      color: "#3AAFA9",
      icon: <FiCode className="w-6 h-6" />
    },
    { 
      value: "78%", 
      label: "Mobile Dev", 
      color: "#3AAFA9",
      icon: <FiSmartphone className="w-6 h-6" />
    },
    { 
      value: "75%", 
      label: "Backend", 
      color: "#3AAFA9",
      icon: <FiDatabase className="w-6 h-6" />
    }
  ];

  return (
    <section id="skills" className="bg-dark py-20 relative overflow-hidden">
      {/* Фоновый градиент */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.h2 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-light text-center mb-4"
          >
            Professional Skills
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-gray-400 text-center mb-16 max-w-2xl mx-auto"
          >
            Expertise in various areas of digital development
          </motion.p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="relative w-full aspect-square">
                  {/* Круговой прогресс */}
                  <svg className="w-full h-full -rotate-90 transform">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      className="fill-none stroke-gray-800"
                      strokeWidth="4"
                    />
                    <motion.circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      className="fill-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: parseInt(stat.value) / 100 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      style={{ stroke: stat.color }}
                    />
                  </svg>
                  
                  {/* Контент в центре */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div 
                      className="w-12 h-12 rounded-full bg-dark/80 backdrop-blur flex items-center justify-center mb-2"
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className="text-primary">
                        {stat.icon}
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-center"
                    >
                      <span className="text-xl md:text-2xl font-bold text-light block">
                        {stat.value}
                      </span>
                      <span className="text-xs md:text-sm text-gray-400">
                        {stat.label}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Декоративные элементы */}
        <motion.div
          className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"
          animate={{ 
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </section>
  );
};

export default Stats; 