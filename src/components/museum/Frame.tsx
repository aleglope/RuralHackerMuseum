import React, { useState, useRef, useContext, forwardRef } from "react";
import { useTexture, Text, useCursor, useFont } from "@react-three/drei";
import * as THREE from "three";
import { ImageMetadata } from "../../core/types";
import { ZoomContext } from "../../contexts/ZoomContext";

interface FrameProps {
  position: [number, number, number];
  rotation: [number, number, number];
  image: ImageMetadata;
  index: number;
  onFrameClick?: (index: number) => void;
  onShowModelViewer: (modelUrl: string) => void;
}

useFont.preload("/fonts/Inter_28pt-SemiBold.ttf");

const Frame = forwardRef<THREE.Mesh, FrameProps>(
  (
    { position, rotation, image, index, onFrameClick, onShowModelViewer },
    ref
  ) => {
    const [hovered, setHovered] = useState(false);
    const [linkHovered, setLinkHovered] = useState(false);
    const [modelLinkHovered, setModelLinkHovered] = useState(false);

    const [error, setError] = useState(false);
    const internalRef = useRef<THREE.Mesh>(null);

    const { zoomedFrameId } = useContext(ZoomContext);
    const isZoomed = zoomedFrameId === index;

    useCursor(hovered);
    useCursor(linkHovered);
    useCursor(modelLinkHovered);

    const texture = useTexture(image.url);

    React.useEffect(() => {
      const handleError = () => {
        console.warn(`Failed to load image ${index + 1}: ${image.url}`);
        setError(true);
      };

      if (
        texture &&
        texture.source &&
        texture.source.data instanceof HTMLImageElement
      ) {
        texture.source.data.addEventListener("error", handleError);
        return () => {
          if (
            texture.source &&
            texture.source.data instanceof HTMLImageElement
          ) {
            texture.source.data.removeEventListener("error", handleError);
          }
        };
      }
    }, [texture, index, image.url]);

    if (texture) {
      texture.minFilter = THREE.LinearFilter;
    }

    const aspectRatio =
      texture && texture.image ? texture.image.width / texture.image.height : 1;
    const width = 1.5;
    const height = width / aspectRatio;

    React.useEffect(() => {
      if (!internalRef.current) return;

      if (typeof ref === "function") {
        ref(internalRef.current);
      } else if (ref) {
        (ref as React.MutableRefObject<THREE.Mesh>).current =
          internalRef.current;
      }
    }, [ref]);

    const handleClick = () => {
      if (onFrameClick) {
        onFrameClick(index);
      }
    };

    const linkBaseY = -height / 2 - 0.31;
    const linkSpacing = 0.15;

    return (
      <group position={position} rotation={rotation}>
        <mesh
          ref={internalRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={handleClick}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[width + 0.1, height + 0.1, 0.1]} />
          <meshStandardMaterial color="#D95829" />

          <mesh position={[0, 0, 0.051]}>
            <planeGeometry args={[width, height]} />
            {error ? (
              <meshBasicMaterial color="#444">
                <Text
                  position={[0, 0, 0.01]}
                  fontSize={0.1}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                  font="Times New Roman"
                >
                  Image not available
                </Text>
              </meshBasicMaterial>
            ) : (
              <meshBasicMaterial map={texture} toneMapped={true} color="#ddd" />
            )}
          </mesh>
        </mesh>

        <Text
          position={[0, height / 2 + 0.1, 0.06]}
          fontSize={0.08}
          color="#fff"
          anchorX="center"
          anchorY="bottom"
          maxWidth={width}
          textAlign="center"
          font="/fonts/Inter_28pt-SemiBold.ttf"
          letterSpacing={-0.005}
        >
          {`${image.title}\n`}
          <meshStandardMaterial emissive="#ffffff" emissiveIntensity={0.5} />
        </Text>
        <Text
          position={[0, -height / 2 - 0.1, 0.06]}
          fontSize={0.05}
          color="#ccc"
          anchorX="center"
          anchorY="top"
          maxWidth={width}
          textAlign="center"
          lineHeight={1.2}
          font="/fonts/Inter_28pt-SemiBold.ttf"
          letterSpacing={-0.003}
        >
          {`${image.artist}\n${image.date}`}
        </Text>

        {isZoomed && image.link && (
          <mesh
            position={[0, linkBaseY, -0.04]}
            onClick={(e) => {
              e.stopPropagation();
              window.open(image.link, "_blank", "noopener, noreferrer");
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setLinkHovered(true);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setLinkHovered(false);
            }}
          >
            <group position={[0, 0, 0.06]}>
              <Text
                fontSize={0.06}
                color={linkHovered ? "#fff" : "#aaa"}
                font="/fonts/Inter_28pt-SemiBold.ttf"
                anchorX="center"
                anchorY="middle"
                letterSpacing={-0.003}
              >
                Open on Instagram →
              </Text>
            </group>
            <boxGeometry args={[0.8, 0.1, 0.05]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}

        {isZoomed && image.modelViewerPath && (
          <mesh
            position={[0, linkBaseY - (image.link ? linkSpacing : 0), -0.04]}
            onClick={(e) => {
              e.stopPropagation();
              if (image.modelViewerPath) {
                onShowModelViewer(image.modelViewerPath);
              }
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setModelLinkHovered(true);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setModelLinkHovered(false);
            }}
          >
            <group position={[0, 0, 0.06]}>
              <Text
                fontSize={0.07}
                color={modelLinkHovered ? "#61dafb" : "#aaa"}
                font="/fonts/Inter_28pt-SemiBold.ttf"
                anchorX="center"
                anchorY="middle"
                letterSpacing={-0.001}
              >
                View 3D Model 🖼️
              </Text>
            </group>
            <boxGeometry args={[0.8, 0.1, 0.05]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}
      </group>
    );
  }
);

export default Frame;
