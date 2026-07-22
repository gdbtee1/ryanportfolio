import { motion } from "framer-motion";

export default function LoadingScreen({
  title = "LOADING WORLD",
  subtitle = "Preparing campaign data...",
}) {
  return (
    <div className="loading-screen">
      <motion.div
        className="loading-window"
        initial={{
          opacity: 0,
          scale: 0.92,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
      >
        <p className="loading-kicker">RYNE PORTFOLIO SYSTEM</p>

        <h1>{title}</h1>

        <div className="loading-progress">
          {Array.from({ length: 12 }).map((_, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0.15 }}
              animate={{ opacity: [0.15, 1, 0.15] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.07,
              }}
            />
          ))}
        </div>

        <p className="loading-subtitle">{subtitle}</p>
      </motion.div>
    </div>
  );
}