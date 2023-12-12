import React from "react";

export default function GoCardLess(props) {
  const { _height, _width } = props;
  const {
    buttonText,
    buttonColor,
    buttonRadius,
    borderWidth,
    borderColor,
    styles
  } = props.buttonStyle;

  console.log(props.buttonStyle)

  return (
    <div>
      <button style={{
        width: _width,
        height: _height,
        backgroundColor: buttonColor,
        color: styles.buttonText.color,
        fontWeight: styles.buttonText.fontWeight,
        fontFamily: styles.buttonText.fontFamily,
        fontSize: styles.buttonText.fontSize,
        borderRadius: buttonRadius,
        borderWidth: borderWidth,
        borderColor: borderColor,
        textAlign: 'center',
      }}>{buttonText}</button>
    </div>
  );
}
