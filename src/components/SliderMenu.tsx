import { CloseIcon } from "@iconicicons/react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import type React from "react";
import { useRef } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";

interface SliderMenuProps {
  title: string;
  hasHeader?: boolean;
  isOpen: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

export default function SliderMenu({
  title,
  hasHeader = true,
  isOpen,
  onClose,
  children
}: SliderMenuProps) {
  const wrapperElementRef = useRef<HTMLDivElement | null>(null);

  const contentElement = isOpen ? (
    <>
      <CloseLayer
        key="SliderMenuCloseLayer"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      <Wrapper
        hasHeader={hasHeader}
        ref={wrapperElementRef}
        variants={animationSlideFromBottom}
        initial="hidden"
        animate="shown"
        exit="hidden"
      >
        <Body>
          {hasHeader && (
            <Header>
              <Title>{title}</Title>
              <ExitButton onClick={onClose} />
            </Header>
          )}
          {children}
        </Body>
      </Wrapper>
    </>
  ) : null;

  return createPortal(
    <AnimatePresence>{contentElement}</AnimatePresence>,
    document.body
  );
}

const ExitButton = styled(CloseIcon)`
  cursor: pointer;
`;

const Wrapper = styled(motion.div)<{
  hasHeader: boolean;
}>`
  position: fixed;
  bottom: 0;
  left: 0;
  height: auto;
  max-height: calc(100% - 66px);
  display: flex;
  flex-direction: column;
  width: 100%;
  z-index: 1000;
  overflow: scroll;
  background-color: ${({ theme }) =>
    theme.displayTheme === "light" ? "#ffffff" : "#1B1B1B"};
  border-radius: 24px 24px 0px 0px;
  padding: ${({ hasHeader }) => (hasHeader ? "0px" : "32px")} 24px 32px;
  box-sizing: border-box;
`;

export const animationSlideFromBottom: Variants = {
  hidden: {
    y: "100vh",
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  shown: {
    y: "0",
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

const Body = styled.div`
  display: flex;
  gap: 15px;
  flex-direction: column;
  position: relative;
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) =>
    theme.displayTheme === "light" ? "#ffffff" : "#1B1B1B"};
  z-index: 2;
  padding-bottom: 24px;
  padding-top: 32px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: inherit;
    z-index: -1;
  }
`;

const Title = styled.h2`
  margin: 0;
  padding: 0;
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

export const CloseLayer = styled(motion.div)`
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  cursor: default;
  background-color: ${({ theme }) =>
    `rgba(0, 0, 0, ${theme.displayTheme === "light" ? 0.3 : 0.7})`};
`;
