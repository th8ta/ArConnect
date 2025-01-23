import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import placeholderUrl from "url:/assets/placeholder.png";

interface ImageProps {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  borderRadius?: number | string;
  fallbackColor?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
}

export default function Image({
  src,
  alt = "",
  width = "100%",
  height = "100%",
  className,
  borderRadius = 0,
  fallbackColor = "#E4E4EB",
  objectFit = "cover"
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <ImageWrapper
      width={width}
      height={height}
      className={className}
      borderRadius={borderRadius}
    >
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius:
                typeof borderRadius === "number"
                  ? `${borderRadius}px`
                  : borderRadius,
              overflow: "hidden"
            }}
          >
            <img
              src={placeholderUrl}
              alt="Loading..."
              style={{
                width: "100%",
                height: "100%",
                objectFit
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.img
        src={src}
        alt={alt}
        draggable={false}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
          borderRadius:
            typeof borderRadius === "number"
              ? `${borderRadius}px`
              : borderRadius,
          background: hasError ? fallbackColor : "transparent"
        }}
      />
    </ImageWrapper>
  );
}

const ImageWrapper = styled.div<{
  width: number | string;
  height: number | string;
  borderRadius: number | string;
}>`
  position: relative;
  width: ${(props) =>
    typeof props.width === "number" ? `${props.width}px` : props.width};
  height: ${(props) =>
    typeof props.height === "number" ? `${props.height}px` : props.height};
  border-radius: ${(props) =>
    typeof props.borderRadius === "number"
      ? `${props.borderRadius}px`
      : props.borderRadius};
  overflow: hidden;
`;
