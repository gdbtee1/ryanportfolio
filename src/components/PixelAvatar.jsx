import { motion } from "framer-motion";

const outfitNames = {
  classic: "Classic",
  explorer: "Explorer",
  racer: "Racer",
  wizard: "Wizard",
};

export default function PixelAvatar({
  outfit = "classic",
  showLabel = true,
}) {
  return (
    <div className="pixel-avatar-wrapper">
      <motion.div
        className={`pixel-avatar outfit-${outfit}`}
        animate={{
          y: [0, -7, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        aria-label={`Pixel character wearing the ${outfitNames[outfit]} outfit`}
      >
        <div className="avatar-shadow" />

        <div className="avatar-character">
          <div className="avatar-hair avatar-hair-back" />

          <div className="avatar-head">
            <div className="avatar-hair avatar-hair-top" />
            <div className="avatar-ear avatar-ear-left" />
            <div className="avatar-ear avatar-ear-right" />

            <div className="avatar-face">
              <span className="avatar-eye avatar-eye-left" />
              <span className="avatar-eye avatar-eye-right" />
              <span className="avatar-mouth" />
            </div>

            {outfit === "wizard" && <div className="wizard-hat" />}
            {outfit === "racer" && <div className="racer-visor" />}
          </div>

          <div className="avatar-neck" />

          <div className="avatar-body">
            <div className="avatar-shirt" />
            <div className="avatar-arm avatar-arm-left" />
            <div className="avatar-arm avatar-arm-right" />

            {outfit === "explorer" && (
              <>
                <div className="explorer-strap explorer-strap-left" />
                <div className="explorer-strap explorer-strap-right" />
              </>
            )}

            {outfit === "racer" && <div className="racer-emblem">R</div>}

            {outfit === "wizard" && <div className="wizard-cloak" />}
          </div>

          <div className="avatar-legs">
            <div className="avatar-leg avatar-leg-left" />
            <div className="avatar-leg avatar-leg-right" />
          </div>
        </div>
      </motion.div>

      {showLabel && (
        <div className="avatar-outfit-label">
          Outfit: <strong>{outfitNames[outfit]}</strong>
        </div>
      )}
    </div>
  );
}