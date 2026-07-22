const SOUND_STORAGE_KEY = "ryne-portfolio-sound-enabled";

let sharedAudioContext = null;

function getInitialSoundPreference() {
  try {
    const storedValue = localStorage.getItem(SOUND_STORAGE_KEY);

    if (storedValue === null) {
      return true;
    }

    return storedValue === "true";
  } catch {
    return true;
  }
}

let soundEnabled = getInitialSoundPreference();

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextClass();
  }

  return sharedAudioContext;
}

function playTone({
  frequency = 440,
  endFrequency = frequency,
  duration = 0.08,
  volume = 0.04,
  type = "square",
  delay = 0,
}) {
  if (!soundEnabled) {
    return;
  }

  const audioContext = getAudioContext();

  if (!audioContext) {
    return;
  }

  const startTime = audioContext.currentTime + delay;
  const endTime = startTime + duration;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;

  oscillator.frequency.setValueAtTime(
    Math.max(frequency, 1),
    startTime,
  );

  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(endFrequency, 1),
    endTime,
  );

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(
    Math.max(volume, 0.0001),
    startTime + 0.01,
  );
  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    endTime,
  );

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(startTime);
  oscillator.stop(endTime + 0.02);
}

function playNoise({
  duration = 0.1,
  volume = 0.03,
  delay = 0,
}) {
  if (!soundEnabled) {
    return;
  }

  const audioContext = getAudioContext();

  if (!audioContext) {
    return;
  }

  const bufferLength = Math.floor(
    audioContext.sampleRate * duration,
  );

  const buffer = audioContext.createBuffer(
    1,
    bufferLength,
    audioContext.sampleRate,
  );

  const data = buffer.getChannelData(0);

  for (let index = 0; index < bufferLength; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  const source = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();

  source.buffer = buffer;

  const startTime = audioContext.currentTime + delay;
  const endTime = startTime + duration;

  gainNode.gain.setValueAtTime(volume, startTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    endTime,
  );

  source.connect(gainNode);
  gainNode.connect(audioContext.destination);

  source.start(startTime);
}

export function playRetroSound(soundName = "click") {
  if (!soundEnabled) {
    return;
  }

  switch (soundName) {
    case "hover":
      playTone({
        frequency: 520,
        endFrequency: 650,
        duration: 0.035,
        volume: 0.018,
      });
      break;

    case "click":
      playTone({
        frequency: 260,
        endFrequency: 190,
        duration: 0.07,
        volume: 0.04,
      });

      playTone({
        frequency: 470,
        endFrequency: 320,
        duration: 0.06,
        volume: 0.025,
        delay: 0.025,
      });
      break;

    case "start":
      playTone({
        frequency: 220,
        endFrequency: 440,
        duration: 0.1,
        volume: 0.045,
      });

      playTone({
        frequency: 440,
        endFrequency: 660,
        duration: 0.1,
        volume: 0.045,
        delay: 0.1,
      });

      playTone({
        frequency: 660,
        endFrequency: 880,
        duration: 0.16,
        volume: 0.05,
        delay: 0.2,
      });
      break;

    case "load":
      playTone({
        frequency: 180,
        endFrequency: 600,
        duration: 0.28,
        volume: 0.03,
      });

      playNoise({
        duration: 0.09,
        volume: 0.015,
        delay: 0.08,
      });
      break;

    case "success":
      playTone({
        frequency: 392,
        endFrequency: 392,
        duration: 0.09,
        volume: 0.04,
      });

      playTone({
        frequency: 523,
        endFrequency: 523,
        duration: 0.09,
        volume: 0.04,
        delay: 0.1,
      });

      playTone({
        frequency: 659,
        endFrequency: 659,
        duration: 0.18,
        volume: 0.05,
        delay: 0.2,
      });
      break;

    case "error":
      playTone({
        frequency: 220,
        endFrequency: 130,
        duration: 0.16,
        volume: 0.045,
      });

      playTone({
        frequency: 160,
        endFrequency: 90,
        duration: 0.18,
        volume: 0.04,
        delay: 0.14,
      });
      break;

    case "secret":
      [262, 330, 392, 523, 659].forEach(
        (frequency, index) => {
          playTone({
            frequency,
            endFrequency: frequency,
            duration: 0.12,
            volume: 0.04,
            delay: index * 0.09,
          });
        },
      );
      break;

    default:
      playTone({
        frequency: 300,
        endFrequency: 230,
        duration: 0.06,
        volume: 0.03,
      });
  }
}

export function getSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(nextValue) {
  soundEnabled = Boolean(nextValue);

  try {
    localStorage.setItem(
      SOUND_STORAGE_KEY,
      String(soundEnabled),
    );
  } catch {
    // The site can continue even if storage is blocked.
  }

  window.dispatchEvent(
    new CustomEvent("retro-sound-change", {
      detail: {
        enabled: soundEnabled,
      },
    }),
  );

  if (soundEnabled) {
    playRetroSound("success");
  }

  return soundEnabled;
}

export function toggleSoundEnabled() {
  return setSoundEnabled(!soundEnabled);
}

export function unlockRetroAudio() {
  const audioContext = getAudioContext();

  if (
    audioContext &&
    audioContext.state === "suspended"
  ) {
    audioContext.resume().catch(() => {
      // Browsers may wait until the next user interaction.
    });
  }
}

export default function useRetroSound() {
  return {
    playSound: playRetroSound,
    isSoundEnabled: getSoundEnabled,
    setSoundEnabled,
    toggleSoundEnabled,
    unlockAudio: unlockRetroAudio,
  };
}