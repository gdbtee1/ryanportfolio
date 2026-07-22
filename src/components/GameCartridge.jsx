import { motion } from "framer-motion";

export default function GameCartridge({
  title,
  subtitle,
  icon,
  onClick,
  index = 0,
}) {
  return (
    <motion.button
      className="game-cartridge"
      onClick={onClick}
      initial={{
        opacity: 0,
        y: 45,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.1 + index * 0.12,
      }}
      whileHover={{
        y: -12,
        rotate: index % 2 === 0 ? -1.5 : 1.5,
      }}
      whileTap={{
        y: 4,
        scale: 0.97,
      }}
    >
      <div className="cartridge-top-ridge">
        {Array.from({ length: 8 }).map((_, ridgeIndex) => (
          <span key={ridgeIndex} />
        ))}
      </div>

      <div className="cartridge-label">
        <div className="cartridge-icon">{icon}</div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
        <small>RYNE SYSTEM</small>
      </div>

      <div className="cartridge-contact-row">
        {Array.from({ length: 9 }).map((_, contactIndex) => (
          <span key={contactIndex} />
        ))}
      </div>
    </motion.button>
  );
}