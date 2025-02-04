import React from 'react';
import './CV.css';

const CV = () => {
  const personalInfo = {
    name: 'Nerses Kalashyan',
    title: 'DevOps Engineer & Mobile Developer',
    email: 'nersesq2003@gmail.com',
    phone: '+374 55 444822',
    location: 'Armenia, Ejmiatsin',
    about: 'DevOps engineer specializing in automation, containerization, and cloud infrastructure. Experienced in mobile development and game development with Unity.'
  };

  const experience = [
    {
      company: 'SmartCode',
      position: 'DevOps Engineer',
      period: '2024 - Present',
      description: 'Working with containerization and automation technologies to streamline development and deployment processes.',
      achievements: [
        'Implementation of Docker containerization',
        'Setting up Kubernetes clusters',
        'Infrastructure automation with Terraform and Ansible'
      ]
    },
    {
      company: 'Armenian Armed Forces',
      position: 'Military Service',
      period: '2022 - 2024',
      description: 'Completed military service.',
      achievements: []
    }
  ];

  const skills = [
    // DevOps Skills
    'Docker', 'Kubernetes', 'Terraform', 'Ansible',
    // Development Skills
    'Unity', 'C#', 'C++', 'Python',
    // Mobile Development
    'Mobile Development', 'QT',
    // Other Skills
    'Git', 'CI/CD', 'Cloud Infrastructure'
  ];

  const education = [
    {
      institution: 'SmartCode',
      degree: 'DevOps Engineering Course',
      period: '2024 - 2025'
    },
    {
      institution: 'State College of Ejmiatsin',
      degree: 'Software Engineering',
      period: '2018 - 2022'
    }
  ];

  const languages = [
    { language: 'Armenian', level: 'Native' },
    { language: 'Russian', level: 'Fluent' },
    { language: 'English', level: 'Basic' }
  ];

  return (
    <div className="cv-container">
      <header className="cv-header">
        <h1>{personalInfo.name}</h1>
        <h2>{personalInfo.title}</h2>
        <div className="contact-info">
          <p>{personalInfo.email}</p>
          <p>{personalInfo.phone}</p>
          <p>{personalInfo.location}</p>
        </div>
        <p className="about">{personalInfo.about}</p>
      </header>

      <section className="cv-section">
        <h3>Experience</h3>
        {experience.map((job, index) => (
          <div key={index} className="experience-item">
            <h4>{job.company}</h4>
            <p className="position">{job.position}</p>
            <p className="period">{job.period}</p>
            <p>{job.description}</p>
            {job.achievements.length > 0 && (
              <ul>
                {job.achievements.map((achievement, i) => (
                  <li key={i}>{achievement}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section className="cv-section">
        <h3>Education</h3>
        {education.map((edu, index) => (
          <div key={index} className="education-item">
            <h4>{edu.institution}</h4>
            <p className="degree">{edu.degree}</p>
            <p className="period">{edu.period}</p>
          </div>
        ))}
      </section>

      <section className="cv-section">
        <h3>Skills</h3>
        <div className="skills-container">
          {skills.map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="cv-section">
        <h3>Languages</h3>
        <div className="languages-container">
          {languages.map((lang, index) => (
            <div key={index} className="language-item">
              <span className="language">{lang.language}</span>
              <span className="level">{lang.level}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CV; 