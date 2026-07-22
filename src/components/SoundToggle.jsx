import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import {
  getSoundEnabled,
  playRetroSound,
  toggleSoundEnabled,
  unlockRetroAudio,
} from "../hooks/useRetroSound";

export default function SoundToggle() {
  const [soundEnabled, setSoundEnabledState] = useState(
    getSoundEnabled(),
  );

  useEffect(() => {
    const handleSoundChange = (event) => {
      setSoundEnabledState(event.detail.enabled);
    };

    const handleFirstInteraction = () => {
      unlockRetroAudio();
    };

    window.addEventListener(
      "retro-sound-change",
      handleSoundChange,
    );

    window.addEventListener(
      "pointerdown",
      handleFirstInteraction,
      {
        once: true,
      },
    );

    window.addEventListener(
      "keydown",
      handleFirstInteraction,
      {
        once: true,
      },
    );

    return () => {
      window.removeEventListener(
        "retro-sound-change",
        handleSoundChange,
      );

      window.removeEventListener(
        "pointerdown",
        handleFirstInteraction,
      );

      window.removeEventListener(
        "keydown",
        handleFirstInteraction,
      );
    };
  }, []);

  useEffect(() => {
    const interactiveSelector =
      "button, a, [role='button'], input, textarea, select";

    let lastHoveredElement = null;

    const handlePointerOver = (event) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const interactiveElement = target.closest(
        interactiveSelector,
      );

      if (
        interactiveElement &&
        interactiveElement !== lastHoveredElement
      ) {
        lastHoveredElement = interactiveElement;
        playRetroSound("hover");
      }
    };

    const handlePointerOut = (event) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const interactiveElement = target.closest(
        interactiveSelector,
      );

      if (interactiveElement === lastHoveredElement) {
        lastHoveredElement = null;
      }
    };

    const handleClick = (event) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const interactiveElement = target.closest(
        interactiveSelector,
      );

      if (interactiveElement) {
        playRetroSound("click");
      }
    };

    document.addEventListener(
      "pointerover",
      handlePointerOver,
    );

    document.addEventListener(
      "pointerout",
      handlePointerOut,
    );

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener(
        "pointerover",
        handlePointerOver,
      );

      document.removeEventListener(
        "pointerout",
        handlePointerOut,
      );

      document.removeEventListener("click", handleClick);
    };
  }, []);

  const handleToggle = () => {
    unlockRetroAudio();

    const nextValue = toggleSoundEnabled();
    setSoundEnabledState(nextValue);
  };

  return (
    <button
      type="button"
      className={`sound-toggle ${
        soundEnabled ? "sound-is-on" : "sound-is-off"
      }`}
      onClick={handleToggle}
      aria-label={
        soundEnabled
          ? "Mute portfolio sounds"
          : "Enable portfolio sounds"
      }
      title={
        soundEnabled ? "Mute sound" : "Enable sound"
      }
    >
      {soundEnabled ? <Volume2 /> : <VolumeX />}

      <span>{soundEnabled ? "SOUND ON" : "SOUND OFF"}</span>
    </button>
  );
}