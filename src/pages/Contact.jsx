import { useState } from "react";
import { motion } from "framer-motion";
import { playRetroSound } from "../hooks/useRetroSound";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Send,
} from "lucide-react";

export default function Contact() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

 const handleSubmit = (event) => {
  event.preventDefault();
  playRetroSound("success");
  setSubmitted(true);
};

  return (
    <section className="contact-page">
      <header className="contact-header">
        <button
          className="icon-retro-button"
          onClick={() => navigate("/game-room")}
          aria-label="Return to game room"
        >
          <ArrowLeft />
        </button>

        <div>
          <p>COMMUNICATION TERMINAL</p>
          <h1>CONTACT</h1>
        </div>

        <span className="contact-online">
          <span />
          ONLINE
        </span>
      </header>

      <div className="contact-layout">
        <motion.div
          className="contact-copy-panel"
          initial={{
            opacity: 0,
            x: -40,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
        >
          <p className="contact-eyebrow">NEW MESSAGE</p>

          <h2>
            Have a campaign, brand, or story that needs a stronger world?
          </h2>

          <p>
            Send a message below with a little information about the
            project, timeline, and what you are hoping to create.
          </p>

          <div className="direct-email-card">
            <Mail />
            <div>
              <span>DIRECT EMAIL</span>
              <strong>hello@rynemitra.com</strong>
            </div>
          </div>

          <div className="contact-terminal-art">
            <div className="terminal-screen">
              <span>&gt; CONNECTION READY</span>
              <span>&gt; PLAYER ONLINE</span>
              <span>&gt; WAITING FOR MESSAGE_</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="contact-form-panel"
          initial={{
            opacity: 0,
            x: 40,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
        >
          {!submitted ? (
            <form
              className="contact-form"
              onSubmit={handleSubmit}
            >
              <label>
                <span>PLAYER NAME</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  required
                />
              </label>

              <label>
                <span>EMAIL ADDRESS</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                <span>PROJECT TYPE</span>
                <select name="projectType" defaultValue="">
                  <option value="" disabled>
                    Select a project type
                  </option>
                  <option value="campaign">
                    Campaign strategy
                  </option>
                  <option value="copywriting">
                    Copywriting
                  </option>
                  <option value="brand">
                    Brand messaging
                  </option>
                  <option value="creative">
                    Creative direction
                  </option>
                  <option value="other">
                    Something else
                  </option>
                </select>
              </label>

              <label>
                <span>MESSAGE</span>
                <textarea
                  name="message"
                  rows="7"
                  placeholder="Tell me about the project..."
                  required
                />
              </label>

              <button
                type="submit"
                className="contact-submit-button"
              >
                SEND MESSAGE
                <Send />
              </button>

              <p className="form-note">
                Form submission will be connected to Formspree before
                launch.
              </p>
            </form>
          ) : (
            <motion.div
              className="contact-success"
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
            >
              <CheckCircle2 />

              <p>MESSAGE SENT</p>

              <h2>Transmission successful.</h2>

              <span>
                Thank you for reaching out. Your message has been added
                to the player inbox.
              </span>

              <button onClick={() => navigate("/game-room")}>
                RETURN TO GAME ROOM
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}