import React from "react";

export default function GoCardLess(props) {
  const { _height, _width } = props

  return (
    <div style={{ width: _width, height: _height }}>
      <span>GoCardLess</span>
    </div>
  );
}
