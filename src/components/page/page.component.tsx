import { type Variants, motion } from "framer-motion";
import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import styled from "styled-components";

export interface PageProps extends PropsWithChildren {}

export function Page({ children }: PageProps) {
  const mainRef = useRef<HTMLDivElement>(null);

  const opacityAnimation: Variants = {
    initial: { opacity: 0 },
    enter: { opacity: 1 },
    exit: { opacity: 0, y: 0, transition: { duration: 0.2 } }
  };

  const [height, setHeight] = useState(0);

  useEffect(() => {
    const mainElement = mainRef.current;

    if (!mainElement || import.meta.env?.VITE_IS_EMBEDDED_APP !== "1") return;

    const resizeObserver = new ResizeObserver((entries) => {
      const height = Math.ceil(entries[0].contentBoxSize[0].blockSize);

      console.log("height =", height);

      if (height > 0) setHeight(height);
    });

    resizeObserver.observe(mainElement);

    // TODO: The parent would need the route or what type of route it is at least, as once inside the wallet we just set a fixed size for all screens.
    // window.parent.postMessage();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <Main
      ref={mainRef}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={opacityAnimation}
      data-test-id="Page"
    >
      {process.env.NODE_ENV === "development" &&
      import.meta.env?.VITE_IS_EMBEDDED_APP === "1" ? (
        <DivLine style={{ top: `${height}px` }} data-height={`${height}px`} />
      ) : null}

      {children}
    </Main>
  );
}

const Main = styled(motion.main)`
  position: relative;
  top: 0;
  width: 100%;
  min-height: ${import.meta.env?.VITE_IS_EMBEDDED_APP === "1"
    ? "none"
    : "100vh"};
  max-height: ${import.meta.env?.VITE_IS_EMBEDDED_APP === "1"
    ? "none"
    : "max-content"};
`;

const DivLine = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  border-bottom: 2px dashed red;

  &::before {
    content: attr(data-height);
    position: absolute;
    top: 2px;
    left: 16px;
    transform: translate(0, -50%);
    padding: 4px 8px;
    background: red;
    font: bold 11px monospace;
    border-radius: 16px;
  }
`;
