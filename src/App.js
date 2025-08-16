import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // This now links to your stylesheet

const App = () => {
  const [theme, setTheme] = useState('dark');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [followerPos, setFollowerPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const animationRef = useRef(null);

  // --- EFFECT HOOKS ---

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Custom cursor animation (desktop only)
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 769px)").matches;

    if (isDesktop) {
      document.body.classList.remove('no-custom-cursor');
      const cursor = document.querySelector('.cursor');
      const cursorFollower = document.querySelector('.cursor-follower');
      cursor.style.display = 'block';
      cursorFollower.style.display = 'block';

      let followerX = followerPos.x;
      let followerY = followerPos.y;

      const animateFollower = () => {
        followerX += (mousePos.x - followerX) * 0.1;
        followerY += (mousePos.y - followerY) * 0.1;
        
        setFollowerPos({ x: followerX, y: followerY });
        animationRef.current = requestAnimationFrame(animateFollower);
      };
      
      animationRef.current = requestAnimationFrame(animateFollower);
    } else {
        document.body.classList.add('no-custom-cursor');
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePos, followerPos.x, followerPos.y]);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    const isDesktop = window.matchMedia("(min-width: 769px)").matches;
    if (isDesktop) {
        window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => setIsNavScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // --- HANDLER FUNCTIONS ---

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  
  const toggleNav = () => {
      setIsNavOpen(prev => {
          document.body.style.overflow = !prev ? 'hidden' : '';
          return !prev;
      });
  };

  const closeNav = () => {
    setIsNavOpen(false);
    document.body.style.overflow = '';
  };

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
    if (isNavOpen) closeNav();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('Sending...');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: 'e5543adc-984a-4ff5-8804-5f8df95163c7',
          ...formData
        })
      });

      const result = await response.json();
      if (result.success) {
        setSubmitStatus('Sent successfully! ✓');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus(`Error: ${result.message}`);
      }
    } catch (error) {
      setSubmitStatus('Error! Please try again.');
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitStatus('');
      }, 3000);
    }
  };
  
  const handleHover = (isHovering) => {
    if (window.matchMedia("(min-width: 769px)").matches) {
        setIsHovering(isHovering);
    }
  };

  return (
    <>
      <div 
        className={`cursor ${isHovering ? 'grow' : ''}`}
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      />
      <div 
        className={`cursor-follower ${isHovering ? 'hidden-follower' : ''}`}
        style={{ transform: `translate(${followerPos.x}px, ${followerPos.y}px)` }}
      />
      <div className="bg-grid" />
      <div className="bg-gradient-orb" />

      <nav id="navbar" className={isNavScrolled ? 'scrolled' : ''}>
        <div className="nav-container">
          <div className="logo">{'<PK/>'}</div>
          <ul className={`nav-links ${isNavOpen ? 'nav-active' : ''}`}>
            <li className="close-menu" onClick={closeNav}><i className="fas fa-times"></i></li>
            <li><a href="#home" onClick={(e) => handleSmoothScroll(e, '#home')}>Home</a></li>
            <li><a href="#about" onClick={(e) => handleSmoothScroll(e, '#about')}>About</a></li>
            <li><a href="#skills" onClick={(e) => handleSmoothScroll(e, '#skills')}>Skills</a></li>
            <li><a href="#projects" onClick={(e) => handleSmoothScroll(e, '#projects')}>Projects</a></li>
            <li><a href="#experience" onClick={(e) => handleSmoothScroll(e, '#experience')}>Experience</a></li>
            <li><a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')}>Contact</a></li>
            <li className="theme-toggle-li">
              <div className="theme-toggle" onClick={toggleTheme}>
                <i className="fas fa-moon"></i><i className="fas fa-sun"></i>
              </div>
            </li>
          </ul>
          <div className="hamburger-menu" onClick={toggleNav}><i className="fas fa-bars"></i></div>
        </div>
      </nav>

      <main>
        <section id="home" className="hero">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">Available for opportunities</div>
              <h1 className="hero-title font-display">Prithiv Raj K</h1>
              <p className="hero-subtitle">Software Development Engineer</p>
              <p className="hero-description">
                Crafting scalable solutions with modern technologies. Specialized in full-stack development,
                AI/ML integration, and cloud-native architectures that drive innovation and solve complex problems.
              </p>
              <div className="hero-actions">
                <a href="#contact" className="btn-primary" onClick={(e) => handleSmoothScroll(e, '#contact')} onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                  <span>Let's Collaborate</span><i className="fas fa-arrow-right"></i>
                </a>
                <a href="#projects" className="btn-secondary" onClick={(e) => handleSmoothScroll(e, '#projects')} onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                  <span>View Projects</span>
                </a>
                <a href="/Prithiv_raj_K.pdf" download className="btn-secondary" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                  <span>Download Resume</span><i className="fas fa-file-arrow-down"></i>
                </a>
              </div>
            </div>
            <div className="hero-image-container">
              <img src="/passport.jpg" alt="Prithiv Raj K" />
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title font-display">Engineering Excellence</h2>
            <p className="section-description">
              B.E. Mechanical Engineering student with a passion for software development. 
              Combining analytical thinking with creative problem-solving to build impactful digital solutions.
            </p>
          </div>
          <div className="stats-grid">
            <div className="stat-card animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <div className="stat-number">450+</div><div className="stat-label">Problems Solved</div>
            </div>
            <div className="stat-card animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <div className="stat-number">Top 14%</div><div className="stat-label">LeetCode Ranking</div>
            </div>
            <div className="stat-card animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <div className="stat-number">8.0</div><div className="stat-label">CGPA</div>
            </div>
            <div className="stat-card animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <div className="stat-number">2026</div><div className="stat-label">Graduate</div>
            </div>
          </div>
        </section>

        <section id="skills" className="section">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title font-display">Skills & Technologies</h2>
            <p className="section-description">
              A comprehensive toolkit spanning frontend, backend, AI/ML, and cloud technologies 
              to deliver end-to-end solutions.
            </p>
          </div>
          <div className="skills-grid">
            {/* Skill Categories */}
            <div className="skill-category animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <h3>Languages & Core</h3>
              <div className="skill-tags">
                {['JavaScript', 'Python', 'Java', 'C++', 'C', 'SQL'].map(skill => <span key={skill} className="skill-tag" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>{skill}</span>)}
              </div>
            </div>
            <div className="skill-category animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <h3>Frontend Development</h3>
              <div className="skill-tags">
                {['React.js', 'HTML5', 'CSS3', 'Responsive Design', 'UI/UX'].map(skill => <span key={skill} className="skill-tag" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>{skill}</span>)}
              </div>
            </div>
            <div className="skill-category animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <h3>Backend & APIs</h3>
              <div className="skill-tags">
                {['Node.js', 'Express.js', 'FastAPI', 'RESTful APIs', 'Microservices'].map(skill => <span key={skill} className="skill-tag" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>{skill}</span>)}
              </div>
            </div>
            <div className="skill-category animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <h3>Database Systems</h3>
              <div className="skill-tags">
                {['MongoDB', 'MySQL', 'Database Design'].map(skill => <span key={skill} className="skill-tag" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>{skill}</span>)}
              </div>
            </div>
            <div className="skill-category animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <h3>AI/ML</h3>
              <div className="skill-tags">
                {['PyTorch', 'OpenCV', 'YOLOv3', 'NumPy', 'Pandas', 'scikit-learn'].map(skill => <span key={skill} className="skill-tag" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>{skill}</span>)}
              </div>
            </div>
            <div className="skill-category animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <h3>DevOps & Cloud</h3>
              <div className="skill-tags">
                {['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Git'].map(skill => <span key={skill} className="skill-tag" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>{skill}</span>)}
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="section">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title font-display">Featured Projects</h2>
            <p className="section-description">
              A collection of projects showcasing full-stack development, AI integration, 
              and innovative problem-solving approaches.
            </p>
          </div>
          <div className="projects-grid">
            {/* Project Cards */}
            <div className="project-card animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <div className="project-content">
                <div className="project-header">
                  <h3 className="project-title">IntelliAssist</h3>
                  <p className="project-description">
                    A sophisticated AI assistant featuring React frontend and FastAPI backend. 
                    Implements voice/text control, centralized logging, and seamless API integrations 
                    for enhanced user experience and functionality.
                  </p>
                </div>
                <div className="project-tech">
                  {['React', 'FastAPI', 'Python', 'Speech API', 'Twilio'].map(tech => <span key={tech} className="tech-tag">{tech}</span>)}
                </div>
                <div className="project-links">
                  <a href="https://github.com/Prithivraj22/Personal-Assistant" target="_blank" rel="noopener noreferrer" className="project-link" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                  <span>GitHub</span><i className="fab fa-github"></i>
                  </a>
                </div>
              </div>
            </div>
            <div className="project-card animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <div className="project-content">
                <div className="project-header">
                  <h3 className="project-title">Nutrix</h3>
                  <p className="project-description">
                    Comprehensive fitness tracking platform with responsive design and robust backend. 
                    Features user authentication, workout management, progress analytics, 
                    and real-time data synchronization.
                  </p>
                </div>
                <div className="project-tech">
                  {['React', 'Node.js', 'Express', 'MongoDB', 'REST API'].map(tech => <span key={tech} className="tech-tag">{tech}</span>)}
                </div>
                <div className="project-links">
                  <a href="https://github.com/Prithivraj22/fitness-tracker-backend" target="_blank" rel="noopener noreferrer" className="project-link" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                    <span>GitHub</span><i className="fab fa-github"></i>
                  </a>
                </div>
              </div>
            </div>
            <div className="project-card animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <div className="project-content">
                <div className="project-header">
                  <h3 className="project-title">360° UAV Surveillance</h3>
                  <p className="project-description">
                    Advanced computer vision system utilizing YOLOv3 for real-time human detection. 
                    Includes automated alert mechanisms, data processing pipelines, 
                    and integration with communication APIs.
                  </p>
                </div>
                <div className="project-tech">
                  {['YOLOv3', 'OpenCV', 'Python', 'NumPy', 'Twilio API'].map(tech => <span key={tech} className="tech-tag">{tech}</span>)}
                </div>
                <div className="project-links">
                  <a href="https://github.com/Prithivraj22/Uav_human_detection_yolo" target="_blank" rel="noopener noreferrer" className="project-link" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                    <span>GitHub</span><i className="fab fa-github"></i>
                  </a>

                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="section">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title font-display">Experience</h2>
            <p className="section-description">
              Professional experiences that shaped my expertise in data science, 
              full-stack development, and collaborative problem-solving.
            </p>
          </div>
          <div className="experience-timeline">
            <div className="timeline-item animate-on-scroll">
              <div className="timeline-marker"></div>
              <div className="timeline-content" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                <div className="timeline-date">2024</div>
                <h3 className="timeline-title">Data Science Intern</h3>
                <div className="timeline-company">V3 Analytics</div>
                <p className="timeline-description">
                  Leveraged advanced data science techniques for comprehensive data cleaning, 
                  exploratory data analysis, preprocessing, and analysis to extract actionable insights 
                  supporting critical business decisions.
                </p>
              </div>
            </div>
            <div className="timeline-item animate-on-scroll">
              <div className="timeline-marker"></div>
              <div className="timeline-content" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                <div className="timeline-date">2024</div>
                <h3 className="timeline-title">MERN Stack Developer</h3>
                <div className="timeline-company">G-Soft Technologies</div>
                <p className="timeline-description">
                  Engineered responsive web applications utilizing the MERN Stack, 
                  advancing expertise in frontend development, backend architecture, 
                  and database integration.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="section">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title font-display">Let's Build Something Amazing</h2>
            <p className="section-description">
              Ready to collaborate on your next project? I'm always excited to work with 
              innovative teams and tackle challenging problems.
            </p>
          </div>
          <div className="contact-container">
            <div className="contact-info animate-on-scroll">
              <div className="contact-item" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                <div className="contact-icon"><i className="fas fa-envelope"></i></div>
                <div className="contact-details"><h4>Email</h4><p>prithiv936@gmail.com</p></div>
              </div>
              <div className="contact-item" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                <div className="contact-icon"><i className="fas fa-phone"></i></div>
                <div className="contact-details"><h4>Phone</h4><p>+91 9361648407</p></div>
              </div>
              <div className="contact-item" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                <div className="contact-icon"><i className="fas fa-map-marker-alt"></i></div>
                <div className="contact-details"><h4>Location</h4><p>Tiruppur, Tamil Nadu, India</p></div>
              </div>
              <div className="social-links">
                <a href="https://www.linkedin.com/in/prithiv-raj-k-1616b2259/" target="_blank" rel="noopener noreferrer" className="social-link linkedin" title="LinkedIn" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}><i className="fab fa-linkedin-in"></i></a>
                <a href="https://github.com/Prithivraj22" target="_blank" rel="noopener noreferrer" className="social-link github" title="GitHub" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}><i className="fab fa-github"></i></a>
                <a href="https://www.instagram.com/its_prithiv_raj" target="_blank" rel="noopener noreferrer" className="social-link instagram" title="Instagram" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}><i className="fab fa-instagram"></i></a>
                <a href="https://wa.me/919361648407" target="_blank" rel="noopener noreferrer" className="social-link whatsapp" title="WhatsApp" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}><i className="fab fa-whatsapp"></i></a>              </div>
            </div>
            <form onSubmit={handleFormSubmit} className="contact-form animate-on-scroll">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input type="text" id="name" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input type="email" id="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" name="subject" className="form-control" value={formData.subject} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea id="message" name="message" className="form-control" value={formData.message} onChange={handleInputChange} required></textarea>
              </div>
              <button type="submit" className="btn-primary" disabled={isSubmitting} onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                <span>{submitStatus || 'Send Message'}</span>
                {!isSubmitting && <i className="fas fa-paper-plane"></i>}
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-content">
          <p className="footer-text">
            © 2025 <span>Prithiv Raj K</span>. Crafted with precision and passion.
          </p>
        </div>
      </footer>
    </>
  );
};

export default App;