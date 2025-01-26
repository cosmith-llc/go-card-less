import React from "react";

export default function DeepLinkingHandler(props) {
  const { editor } = props;
  if (editor) {
    return (<div style={ { color: "red" }}>@cosmith deep link!</div>);
  }
  return (<></>);
}
