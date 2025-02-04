import React from 'react';
import { motion } from 'framer-motion';

const Portfolio = () => {
  const projects = [
    {
      title: "Project 1",
      image: "/images/project1.svg",
      category: "Web Design"
    },
    {
      title: "Project 2",
      image: "/images/project2.svg",
      category: "UI/UX"
    },
    {
      title: "Project 3",
      image: "/images/project3.svg",
      category: "Development"
    }
  ];

  return (
    <section id="works" className="bg-dark py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-light text-center mb-16">Creative Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="group relative overflow-hidden rounded-lg"
            >
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-light mb-2">{project.title}</h3>
                  <p className="text-primary">{project.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio; 