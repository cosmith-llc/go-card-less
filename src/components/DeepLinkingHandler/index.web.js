import React from "react";

export default function DeepLinkingHandler(props) {
  const { editor } = props;
  if (editor) {
    return (<div>@cosmith deep link</div>);
  }
  return (<></>);
}
