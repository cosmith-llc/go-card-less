import React, { Component } from 'react';
import { Linking, Text, TouchableHighlight } from 'react-native';
import uuid from 'react-native-uuid';

export default class GoCardLessButton extends Component {

  constructor(props) {
    super(props);
    const { uriSchema, urlHostname, api, auth, path } = props;

    this.state = {
      api: api,
      auth: auth,
      redirectUrl: `${uriSchema}://${urlHostname}/gocardless/${path}`,
    };
  }

  createRedirectFlow = () => {
    const token = uuid.v4();

    fetch(`${this.state.api}/redirect_flows`, {
      method: 'POST',
      headers: {
        Authorization: `${this.state.auth}`,
        'Content-Type': 'application/json',
        'GoCardless-Version': '2015-07-06',
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        redirect_flows: {
          session_token: token,
          success_redirect_url: `https://us-central1-gifted-torus-357511.cloudfunctions.net/redirect-to-mobile?uri=${this.state.redirectUrl}`
        }
      }),
    }).then((response) => response.json())
      .then((json) => {
        const redirectFlow = json.redirect_flows;

        const { onSuccessRedirect } = this.props;
        if (onSuccessRedirect) {
          onSuccessRedirect(token, redirectFlow.id);
        }

        Linking.openURL(redirectFlow.redirect_url);
      });
  }

  render() {
    const { _height, _width } = this.props
    const {
      buttonText,
      buttonColor,
      buttonRadius,
      borderWidth,
      borderColor,
      styles
    } = this.props.buttonStyle;

    let radius;
    if (_height > _width) {
      radius = _width / 2 < buttonRadius ? _width / 2 : buttonRadius
    } else {
      radius = _height / 2 < buttonRadius ? _height / 2 : buttonRadius
    }

    return (
      <TouchableHighlight
        onPress={this.createRedirectFlow}
        style={{
          height: _height,
          width: _width,
          backgroundColor: buttonColor,
          borderRadius: radius,
          borderWidth: borderWidth,
          borderColor: borderColor,
        }}>
        <Text
          style={{
            height: _height,
            lineHeight: _height,
            width: _width,
            textAlign: 'center',
            color: styles.buttonText.color,
            fontWeight: styles.buttonText.fontWeight,
            fontFamily: styles.buttonText.fontFamily,
            fontSize: styles.buttonText.fontSize,
          }}>{buttonText}</Text>
      </TouchableHighlight>
    )
  }
}
