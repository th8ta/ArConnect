import type React from "react";
import Lottie from "react-lottie";
import wanderLogo from "assets/lotties/wander-logo.json";
import wanderLogoLight from "assets/lotties/wander-logo-light.json";
import { useTheme } from "styled-components";
import { useEffect, useState } from "react";
import { ExtensionStorage } from "~utils/storage";

interface WanderLogoProps {
  width?: number;
  height?: number;
}

const UpdateSplash: React.FC<WanderLogoProps> = ({
  width = 200,
  height = 200
}) => {
  const theme = useTheme();
  const isLight = theme.displayTheme === "light";
  const [showSplash, setShowSplash] = useState<boolean>(false);

  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: isLight ? wanderLogoLight : wanderLogo,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  useEffect(() => {
    const showSplash = async () => {
      const isSplashScreenSeen = Boolean(
        await ExtensionStorage.get("update_splash_screen_seen")
      );
      if (!isSplashScreenSeen) {
        await ExtensionStorage.set("update_splash_screen_seen", true);
        setShowSplash(true);
      }
    };
    showSplash();
  }, [showSplash]);

  if (showSplash) {
    return (
      <div style={{ width, height }}>
        <Lottie options={defaultOptions} height={250} width={250} />
      </div>
    );
  }

  return <></>;
};

export default UpdateSplash;
