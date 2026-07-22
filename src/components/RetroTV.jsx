import { motion } from "framer-motion";

export default function RetroTV({ activeChannel = "SELECT A CARTRIDGE" }) {
  return (
    <motion.div
      className="retro-tv"
      initial={{
        opacity: 0,
        scale: 0.88,
        rotateX: 8,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        rotateX: 0,
      }}
      transition={{
        duration: 0.55,
      }}
    >
      <div className="tv-antennas">
        <span />
        <span />
      </div>

      <div className="tv-body">
        <div className="tv-screen-frame">
          <div className="tv-screen">
            <div className="tv-scanlines" />
            <div className="tv-static" />

            <div className="tv-screen-content">
              <span className="tv-channel-label">CHANNEL 03</span>
              <h2>{activeChannel}</h2>
              <p>Insert a portfolio cartridge to continue.</p>

              <div className="tv-loading-bars">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>

        <div className="tv-controls">
          <div className="tv-speaker">
            {Array.from({ length: 12 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>

          <div className="tv-knobs">
            <span />
            <span />
          </div>
        </div>
      </div>

      <div className="tv-feet">
        <span />
        <span />
      </div>
    </motion.div>
  );
}