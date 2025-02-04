import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiPhone, FiMapPin, FiMail, FiGithub } from 'react-icons/fi';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    // ... обработка отправки формы
  };

  const contactInfo = [
    { 
      icon: <FiPhone />, 
      text: "+374 55 444822", 
      label: "Phone",
      link: "tel:+37455444822"
    },
    { 
      icon: <FiMapPin />, 
      text: "Armenia, Ejmiatsin", 
      label: "Location",
      link: "https://goo.gl/maps/Ejmiatsin"
    },
    { 
      icon: <FiMail />, 
      text: "nersesq2003@gmail.com", 
      label: "Email",
      link: "mailto:nersesq2003@gmail.com"
    },
    { 
      icon: <FiGithub />, 
      text: "github.com/BloodyNQ", 
      label: "GitHub",
      link: "https://github.com/BloodyNQ"
    }
  ];

  return (
    <section id="contact" className="bg-dark py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.h2 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-light text-center mb-4"
          >
            Get In Touch
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-gray-400 text-center mb-16 max-w-2xl mx-auto"
          >
            Feel free to reach out for collaborations or just a friendly hello
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Контактная информация */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {contactInfo.map((item, index) => (
                <motion.a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="block bg-[#1a1f24]/50 backdrop-blur-sm p-6 rounded-2xl border border-primary/10 hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/30 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">{item.label}</p>
                      <p className="text-light font-medium group-hover:text-primary transition-colors">{item.text}</p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </motion.div>

            {/* Форма */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#1a1f24]/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-light block mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-dark/50 border border-primary/10 rounded-lg focus:border-primary/30 focus:outline-none text-light"
                    required
                  />
                </div>
                <div>
                  <label className="text-light block mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-dark/50 border border-primary/10 rounded-lg focus:border-primary/30 focus:outline-none text-light"
                    required
                  />
                </div>
                <div>
                  <label className="text-light block mb-2">Message</label>
                  <textarea
                    placeholder="Your message..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 bg-dark/50 border border-primary/10 rounded-lg focus:border-primary/30 focus:outline-none text-light h-32 resize-none"
                    required
                  ></textarea>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 group"
                  disabled={status === 'sending'}
                >
                  <span>{status === 'sending' ? 'Sending...' : 'Send Message'}</span>
                  <FiSend className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </motion.button>

                {status === 'success' && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-400 text-center"
                  >
                    Message sent successfully!
                  </motion.p>
                )}
              </form>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Nerses Kalashyan. All Rights Reserved.</p>
        </div>
      </div>
    </section>
  );
};

export default Contact; 