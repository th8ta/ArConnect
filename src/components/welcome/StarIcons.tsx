import StarIcon from "./StarIcon";

type StarProps = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  opacity: number;
  size: number;
};

const stars: readonly StarProps[] = [
  { left: 178, top: 70, opacity: 0.4, size: 41 },
  { right: 72.8, top: 81, opacity: 0.4, size: 60 },
  { right: 429, top: 199, opacity: 0.4, size: 41 },
  { left: 429, top: 292, opacity: 0.2, size: 60 },
  { right: 161, bottom: 464, opacity: 0.4, size: 94 },
  { left: 78, bottom: 382, opacity: 0.4, size: 41 },
  { right: 528, bottom: 253, opacity: 0.4, size: 41 },
  { left: 456, bottom: 199, opacity: 0.4, size: 95 },
  { right: 132, bottom: 101, opacity: 0.4, size: 60 }
] as const;

interface StarIconsProps {
  screen?: "welcome" | "setup";
}

export default function StarIcons({ screen = "welcome" }: StarIconsProps) {
  const isWelcomeScreen = screen === "welcome";
  const displayStars = isWelcomeScreen ? stars : stars.slice(2, 8);

  return displayStars.map((star, index) => (
    <StarIcon
      key={`star-${index}`}
      {...star}
      opacity={isWelcomeScreen ? star.opacity : 0.1}
    />
  ));
}
