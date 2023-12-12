import React, { Component } from 'react';
import { Linking, Text, TouchableHighlight } from 'react-native';
import uuid from 'react-native-uuid';

export default class GoCardLess extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentUrl: null,
      redirectFlowId: null,
      mandate: null,
      bankAccount: null,
      sessionToken: null,
      redirectUrl: "cosm://cosm.gocardless.do/success"
    };

    this.handleUrlChange = this.handleUrlChange.bind(this);
  }

  createRedirectFlow = () => {
    const { api, auth } = this.props;
    const token = uuid.v4();
    this.setState({ sessionToken: token });

    fetch(`${api}/redirect_flows`, {
      method: 'POST',
      headers: {
        Authorization: auth,
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

        this.setState({ redirectFlowId: redirectFlow.id });
        Linking.openURL(redirectFlow.redirect_url);
      });
  }

  componentDidMount() {
    Linking.addEventListener('url', this.handleUrlChange);
    Linking.getInitialURL().then((url) => this.setState({ currentUrl: url }));
  }

  handleUrlChange({ url }) {
    this.setState({ currentUrl: url });

    if (url === this.state.redirectUrl) {
      this.completeRedirectFlow();
    }
  }

  completeRedirectFlow() {
    const { api, auth } = this.props;

    fetch(`${api}/redirect_flows/${this.state.redirectFlowId}/actions/complete`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
        'GoCardless-Version': '2015-07-06'
      },
      body: JSON.stringify({
        data: {
          session_token: this.state.sessionToken,
        }
      }),
    }).then(response => response.json())
      .then(json => {
        const mandate = json.redirect_flows.links.mandate;
        const bankAccount = json.redirect_flows.links.customer_bank_account;
        this.setState({ mandate: mandate, bankAccount: bankAccount })

        const { onMandateAction } = this.props;

        if (onMandateAction) {
          onMandateAction(mandate, bankAccount);
        }
      })
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
