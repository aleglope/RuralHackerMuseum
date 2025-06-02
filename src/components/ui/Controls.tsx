import React, { useState, useEffect, useRef } from "react";
import { Keyboard, Info, Volume2, VolumeX } from "lucide-react";

interface ControlsProps {
  style?: React.CSSProperties;
}

const Controls: React.FC<ControlsProps> = ({ style }) => {
  const [displaySettings, setDisplaySettings] = useState<
    "none" | "information" | "settings"
  >("none");
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/bgmusic.mp3");
    audio.loop = true;
    audio.volume = isMuted ? 0 : 0.06;
    audioRef.current = audio;

    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.error(
            "Error playing audio waiting for user interaction",
            error
          );
        });
      }
    };

    playAudio();

    const handleUserInteraction = () => {
      playAudio();
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = 0.06;
      } else {
        audioRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <div style={style}>
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={toggleMute}
          className="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 transition-colors"
          aria-label={isMuted ? "Activer le son" : "Couper le son"}
        >
          {isMuted ? (
            <VolumeX size={20} className="text-white" />
          ) : (
            <Volume2 size={20} className="text-white" />
          )}
        </button>

        <button
          onClick={() =>
            setDisplaySettings((prev) =>
              prev === "settings" ? "none" : "settings"
            )
          }
          className="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 transition-colors"
        >
          <Keyboard size={20} className="text-white" />
        </button>
        <button
          onClick={() =>
            setDisplaySettings((prev) =>
              prev === "information" ? "none" : "information"
            )
          }
          className="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 transition-colors"
        >
          <Info size={20} className="text-white" />
        </button>
      </div>

      {displaySettings === "settings" && (
        <div className="absolute bottom-20 right-4 bg-black/80 backdrop-blur-md p-4 rounded-lg text-white w-96">
          <h3 className="text-lg font-semibold mb-2">Controls</h3>

          <h5 className="font-semibold">Starting the Tour</h5>
          <ul className="text-sm">
            <li>• Click "Start the Tour" to view the first artwork.</li>
            <li>
              • Use the left (←) and right (→) arrow keys or the on-screen
              buttons to navigate between artworks.
            </li>
          </ul>
          <h5 className="mt-3 font-semibold">Exploring Freely</h5>
          <ul className="text-sm">
            <li>• Click on any artwork to display it directly.</li>
            <li>
              • From there, navigate using the arrow keys or buttons as in the
              guided tour.
            </li>
          </ul>

          <h5 className="mt-3 font-semibold">Exiting the Tour</h5>
          <ul className="text-sm">
            <li>
              • Press Esc or click on the displayed artwork to return to the
              beginning.
            </li>
          </ul>

          <h5 className="mt-3 font-semibold">Audio</h5>
          <ul className="text-sm">
            <li>• Click the sound icon to mute/unmute the background music.</li>
          </ul>
        </div>
      )}

      {displaySettings === "information" && (
        <div className="absolute bottom-20 right-4 bg-black/80 backdrop-blur-md p-4 rounded-lg text-white w-96">
          <h3 className="text-lg font-semibold mb-2">Information</h3>

          <p>
            Welcome to my interactive 3D museum! This project was created to
            showcase my drawings in an immersive way using Three.js and React.
          </p>
          <br />
          <p>
            "Metal Bench" 3D model by{" "}
            <a
              href="https://sketchfab.com/JanStano"
              target="_blank"
              className="underline"
            >
              JanStano
            </a>
          </p>
          <br />
          <p>
            Developed by{" "}
            <a
              href="https://www.instagram.com/alejandro.alewences/"
              target="_blank"
              className="underline"
            >
              @alejandro.alewences
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default Controls;
