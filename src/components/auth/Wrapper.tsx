import styled from "styled-components";

const Wrapper = styled.div<{ withBackground?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
  background: ${({ theme, withBackground }) =>
    withBackground
      ? `linear-gradient(180deg, #26126f 0%, ${
          theme.displayTheme === "dark" ? "#111" : "#f2f2f2"
        } 150px);`
      : "transparent"};
`;

export default Wrapper;
