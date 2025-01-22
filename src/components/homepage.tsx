import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/home.module.css"; // Use CSS modules

const Homepage = () => {
  return (
    <div className={styles.homepage}>
      {/* Header Section */}
      <header className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link to="/" className={styles.navLogo}>
            InflowChat
          </Link>
          <nav className={styles.navMenu}>
            <li className={styles.navItem}>
              <Link to="/login" className={styles.navLinks}>
                Login
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/signup" className={styles.navLinks}>
                SignUp
              </Link>
            </li>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>"Empower Conversations with Custom AI Solutions"</h1>
          <p>
            InfoFlow Chat leverages advanced AI capabilities to deliver seamless
            and context-aware interactions. Designed for organizations, it
            processes custom datasets to provide intelligent responses and
            enhances productivity through efficient communication.
          </p>
        </div>
      </section>

      {/* Info Section */}
      <section className={styles.Infocontainer}>
        <h2 className={styles.heading}>Why Choose InfoFlow Chat?</h2>
        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.image}>
              <img src="/CustomeData.png" alt="Custom data Powered" />
            </div>
            <div className={styles.text}>
              <h3 className={styles.cardTitle}>Custom Data Integration</h3>
              <p>
                InfoFlow Chat is powered by Python (FastAPI/Flask) to process API
                requests and integrate custom datasets, enabling tailored
                responses for specific organizational needs.
              </p>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.image}>
              <img src="/gemini.png" alt="Conversational ChatBot" />
            </div>
            <div className={styles.text}>
              <h3 className={styles.cardTitle}>Enhanced Conversational AI</h3>
              <p>
                InfoFlow Chat utilizes Gemini API to provide highly
                interactive and dynamic conversations. With LangChain, it excels in
                data retrieval and complex query handling.
              </p>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.image}>
              <img src="/UI.png" alt="Responsive & Clean UI" />
            </div>
            <div className={styles.text}>
              <h3 className={styles.cardTitle}>Responsive & Clean UI</h3>
              <p>
                IntelliChat is also accompanied by a clean and responsive user
                interface. The UI is designed to provide a seamless and intuitive
                user experience across platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.header}>
            <p>Copyright © 2025 InflowChat. Designed By <strong>RikkeiSoft</strong></p>
          </div>
          <div className={styles.handles}>
            <a href="https://rikkeisoft.com" target="_blank" rel="noopener noreferrer">
              <img src="/logo.png" alt="RikkeiSoft Logo" className={styles.logo} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;