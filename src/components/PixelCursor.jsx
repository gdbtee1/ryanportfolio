import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function PixelCursor() {
  const [position, setPosition] = useState({
    x: -100,
    y: -100,
  });

  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setIsVisible(true);
    };

    const handleMouseOver = (event) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const interactiveElement = target.closest(
        "button, a, input, textarea, select, [role='button']",
      );

      setIsHovering(Boolean(interactiveElement));
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <motion.div
      className={`pixel-cursor ${
        isHovering ? "pixel-cursor-hovering" : ""
      }`}
      animate={{
        x: position.x,
        y: position.y,
        opacity: isVisible ? 1 : 0,
        scale: isHovering ? 1.35 : 1,
      }}
      transition={{
        x: {
          duration: 0,
        },
        y: {
          duration: 0,
        },
        opacity: {
          duration: 0.15,
        },
        scale: {
          duration: 0.12,
        },
      }}
      aria-hidden="true"
    >
      <span className="pixel-cursor-pointer" />
      <span className="pixel-cursor-glow" />
    </motion.div>
  );
}