import { motion } from "framer-motion";

export default function ScreenTransition({ children }) {
  return (
    <motion.main
      className="screen-transition"
      initial={{
        opacity: 0,
        filter: "brightness(2)",
      }}
      animate={{
        opacity: 1,
        filter: "brightness(1)",
      }}
      exit={{
        opacity: 0,
        filter: "brightness(0)",
      }}
      transition={{
        duration: 0.35,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.main>
  );
}