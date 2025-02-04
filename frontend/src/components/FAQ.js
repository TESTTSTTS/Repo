import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiHelpCircle } from 'react-icons/fi';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const questions = [
    {
      question: "How to get started?",
      answer: "Contact us through the form below or send us an email. We'll schedule a free consultation to discuss your project needs and goals.",
      color: "from-[#3AAFA9] to-[#2B7A78]"
    },
    {
      question: "What is your process?",
      answer: "We follow an agile methodology with regular updates and feedback cycles. Each project goes through discovery, design, development, and testing phases.",
      color: "from-[#2B7A78] to-[#17252A]"
    },
    {
      question: "What are your rates?",
      answer: "Our rates vary depending on project complexity and requirements. We offer flexible pricing models including fixed price and time & materials.",
      color: "from-[#17252A] to-[#3AAFA9]"
    }
  ];

  return (
    <section id="faq" className="bg-dark py-20 relative overflow-hidden">
      {/* Декоративный фоновый элемент */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-transparent" />
        <FiHelpCircle className="absolute right-10 top-10 w-64 h-64 text-primary opacity-10" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.h2 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-light text-center mb-16"
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="max-w-3xl mx-auto space-y-4">
          {questions.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mb-4"
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full text-left"
              >
                <div className="bg-[#1a1f24] p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl text-light font-medium">{item.question}</h3>
                    <FiChevronDown 
                      className={`w-5 h-5 text-primary transition-transform ${
                        activeIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  
                  <AnimatePresence>
                    {activeIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <div className={`h-0.5 bg-gradient-to-r ${item.color} mb-4`} />
                        <p className="text-gray-400">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ; 