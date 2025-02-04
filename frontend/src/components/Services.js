import React from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiSmartphone, FiCloud, FiMonitor } from 'react-icons/fi';

const Services = () => {
  const services = [
    {
      icon: <FiCloud />,
      title: "DevOps Engineering",
      description: "Process automation for development and deployment using Docker, Kubernetes, Terraform, and Ansible."
    },
    {
      icon: <FiMonitor />,
      title: "Unity Development",
      description: "Game and application development using Unity and C#, including mobile and desktop platforms."
    },
    {
      icon: <FiSmartphone />,
      title: "Mobile Development",
      description: "Cross-platform mobile application development using modern technologies and frameworks."
    },
    {
      icon: <FiCode />,
      title: "Backend Development",
      description: "Server-side application development using C++, Python, and other technologies."
    }
  ];

  return (
    <section id="services" className="bg-dark py-20 relative overflow-hidden">
      {/* Фоновый градиент */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-light text-center mb-4"
          >
            What We Do?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1a1f24]/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 hover:border-primary/20 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                  <div className="text-primary text-2xl">
                    {service.icon}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-light mb-4">
                  {service.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed">
                  {service.description}
                </p>
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

export default Services; 