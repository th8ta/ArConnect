import styled from "styled-components";

export const Link = styled.a.attrs({
  target: "_blank",
  rel: "noopener noreferrer"
})`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: rgb(${(props) => props.theme.secondaryText});
  font-weight: 500;
  font-size: 0.9rem;
  text-decoration: none;
  width: max-content;
  transition: all 0.23s ease-in-out;

  svg {
    font-size: 1.2em;
    width: 1em;
    height: 1em;
  }

  &:hover {
    opacity: 0.8;
  }
`;
