import React from "react";
import type { CSSProperties } from "styled-components";

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: CSSProperties["flexDirection"];
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  wrap?: CSSProperties["flexWrap"];
  gap?: CSSProperties["gap"];
  flex?: CSSProperties["flex"];
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
}

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = "row",
  align = "stretch",
  justify = "flex-start",
  wrap = "nowrap",
  gap = 0,
  flex,
  width,
  height,
  style,
  ...props
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap,
        gap,
        flex,
        width,
        height,
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};
