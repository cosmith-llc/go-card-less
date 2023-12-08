import React, { useState } from "react";
import uuid from 'react-uuid';

export default function GoCardLess(props) {
  const { _height, _width, api, auth } = props
  const [redirectFlowId, setRedirectFlowId] = useState(null);

  const createRedirectFlow = () => {
    const token = uuid();

    fetch(`${api}/redirect_flows`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
        'GoCardless-Version': '2015-07-06'
      },
      body: JSON.stringify({
        redirect_flows: {
          session_token: token,
          success_redirect_url: `${window.location.href}?redirect=success`
        }
      }),
    }).then((response) => response.json())
      .then((json) => {
        const redirectFlow = json.redirect_flows;

        setRedirectFlowId(redirectFlow.id);
        window.open(redirectFlow.redirect_url, '_blank')
      });
  }

  return (
    <div style={{ width: _width, height: _height }}>
      <button onClick={createRedirectFlow}>Create Redirect Flow</button>
      <p>Mandate: </p>
      <p>Redirect Flow Id: </p>
      <p>Customer Bank Account:</p>
    </div>
  );
}
