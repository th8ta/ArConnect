import type React from "react";
import Lottie from "react-lottie";
import wanderLogo from "assets/lotties/wander-logo.json";
import wanderLogoLight from "assets/lotties/wander-logo-light.json";

interface WanderLogoProps {
  width?: number;
  height?: number;
}

const UpdateSplash: React.FC<WanderLogoProps> = ({
  width = 200,
  height = 200
}) => {
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: wanderLogo,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
      progressiveLoad: true
    }
  };

  return (
    <div style={{ width, height }}>
      <Lottie options={defaultOptions} height={200} width={200} />
    </div>
  );
};

export default UpdateSplash;
