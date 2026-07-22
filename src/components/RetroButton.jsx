import { motion } from "framer-motion";

export default function RetroButton({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}) {
  return (
    <motion.button
      type={type}
      className={`retro-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={
        disabled
          ? {}
          : {
              y: -3,
              scale: 1.02,
            }
      }
      whileTap={
        disabled
          ? {}
          : {
              y: 3,
              scale: 0.98,
            }
      }
    >
      <span>{children}</span>
    </motion.button>
  );
}