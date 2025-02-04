import React from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiBook } from 'react-icons/fi';

const Experience = () => {
  const experiences = [
    {
      period: "2024 - Present",
      title: "DevOps Engineer",
      company: "SmartCode",
      description: "DevOps engineer working with Docker, Kubernetes, Terraform, Ansible"
    },
    {
      period: "2022 - 2024",
      title: "Military Service",
      company: "Armenian Armed Forces",
      description: "Military service"
    }
  ];

  const education = [
    {
      period: "2024 - 2025",
      title: "DevOps Engineering",
      institution: "SmartCode",
      description: "DevOps Engineering Course"
    },
    {
      period: "2018 - 2022",
      title: "Software Engineering",
      institution: "State College of Ejmiatsin",
      description: "Specialization: Software Engineer"
    }
  ];

  return (
    <section id="experience" className="bg-dark py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Опыт работы */}
          <div className="mb-20">
            <motion.h2 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold text-light text-center mb-16"
            >
              Experience
            </motion.h2>

            <div className="space-y-8">
              {experiences.map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#1a1f24]/50 backdrop-blur-sm p-6 rounded-2xl border border-primary/10 hover:border-primary/20 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <FiBriefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="text-primary text-sm">{exp.period}</span>
                      <h3 className="text-xl font-bold text-light mt-1">{exp.title}</h3>
                      <p className="text-gray-400 mt-1">{exp.company}</p>
                      <p className="text-gray-500 mt-2">{exp.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Образование */}
          <div>
            <motion.h2 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold text-light text-center mb-16"
            >
              Education
            </motion.h2>

            <div className="space-y-8">
              {education.map((edu, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#1a1f24]/50 backdrop-blur-sm p-6 rounded-2xl border border-primary/10 hover:border-primary/20 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <FiBook className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="text-primary text-sm">{edu.period}</span>
                      <h3 className="text-xl font-bold text-light mt-1">{edu.title}</h3>
                      <p className="text-gray-400 mt-1">{edu.institution}</p>
                      <p className="text-gray-500 mt-2">{edu.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience; 