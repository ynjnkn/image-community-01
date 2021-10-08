import React from "react";
import styled from "styled-components";

const Text = (props) => {
  // bold = props.bold;
  // color = props.color;
  // size = props.size;
  // children = props.children;
  // margin = props.margin;
  const { bold, color, size, children } = props;

  const styles = {bold: bold, color: color, size: size};

  return (
      <P {...styles}>
          {children}
      </P>
  )
};

// Text.js의 defaultProps
Text.defaultProps = {
  children: null, // text contents
  bold: false,
  color: "#222831", // font color
  size: "14px", // font size
};

const P = styled.p`
  color: ${(props) => props.color};
  font-size: ${(props) => props.size};
  font-weight: ${(props) => (props.bold? "600" : "400")};
`;

export default Text;