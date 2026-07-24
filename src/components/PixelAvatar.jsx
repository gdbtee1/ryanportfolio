import { motion } from "framer-motion";

const characterNames = {
  mario: "Mario",
  luigi: "Luigi",
};

const outfitNames = {
  plumber: "Plumber",
  electrician: "Electrician",
  creative: "Creative",
  formal: "Formal",
};

export default function PixelAvatar({
  character = "mario",
  outfit = "plumber",
  showLabel = true,
}) {
  const characterName = characterNames[character] ?? "Character";
  const outfitName = outfitNames[outfit] ?? "Outfit";

  return (
    <div className="pixel-avatar-wrapper">
      <motion.div
        className={`pixel-avatar character-${character} outfit-${outfit}`}
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        aria-label={`${characterName} facing forward in the ${outfitName} outfit`}
      >
        <div className="avatar-shadow" />

        <div className="avatar-character">
          <div className="avatar-head">
            <div className="avatar-cap">
              <span className="avatar-cap-badge">
                {character === "luigi" ? "L" : "M"}
              </span>
            </div>

            <div className="avatar-ear avatar-ear-left" />
            <div className="avatar-ear avatar-ear-right" />

            <div className="avatar-face">
              <span className="avatar-eye avatar-eye-left" />
              <span className="avatar-eye avatar-eye-right" />
              <span className="avatar-nose" />
              <span className="avatar-mustache avatar-mustache-left" />
              <span className="avatar-mustache avatar-mustache-right" />
            </div>
          </div>

          <div className="avatar-neck" />

          <div className="avatar-body">
            <div className="avatar-shirt" />
            <div className="avatar-overalls">
              <span className="overall-strap overall-strap-left" />
              <span className="overall-strap overall-strap-right" />
              <span className="overall-button overall-button-left" />
              <span className="overall-button overall-button-right" />
              <span className="overall-pocket" />
            </div>

            <div className="avatar-arm avatar-arm-left" />
            <div className="avatar-arm avatar-arm-right" />

            {outfit === "electrician" && (
              <>
                <div className="electrician-belt" />
                <div className="electrician-tool electrician-tool-left" />
                <div className="electrician-tool electrician-tool-right" />
              </>
            )}

            {outfit === "creative" && <div className="creative-pencil" />}
            {outfit === "formal" && <div className="formal-tie" />}
          </div>

          <div className="avatar-hands">
            <span className="avatar-hand avatar-hand-left" />
            <span className="avatar-hand avatar-hand-right" />
          </div>

          <div className="avatar-legs">
            <div className="avatar-leg avatar-leg-left" />
            <div className="avatar-leg avatar-leg-right" />
          </div>
        </div>
      </motion.div>

      {showLabel && (
        <div className="avatar-outfit-label">
          <strong>{characterName}</strong>
          <span> / {outfitName}</span>
        </div>
      )}
    </div>
  );
}
