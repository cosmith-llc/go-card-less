import React, { Component } from 'react';
import { Linking, Text } from 'react-native';

export default class GoCardLessFinalizer extends Component {

  constructor(props) {
    super(props);
    const { uriSchema, urlHostname } = props;

    this.state = {
      currentUrl: null,
      redirectUrl: `${uriSchema}://${urlHostname}/gocardless`
    };

    this.handleUrlChange = this.handleUrlChange.bind(this);
  }

  componentDidMount() {
    Linking.addEventListener('url', this.handleUrlChange);
    Linking.getInitialURL().then((url) => this.setState({ currentUrl: url }));
  }

  componentWillMount() {
    this.setState({ currentUrl: null });
  }

  componentDidUpdate(prevProps, prevState) {
    const { sessionToken, redirectFlowId, status } = this.props;
    if (this.state.currentUrl != null && this.state.redirectUrl != null) {
      if (status === "pending" && prevProps.sessionToken !== sessionToken && prevProps.redirectFlowId !== redirectFlowId) {
        if (this.state.currentUrl.toLowerCase().includes(this.state.redirectUrl)) {
          this.completeRedirectFlow();
        }
      }
    }
  }

  handleUrlChange({ url }) {
    this.setState({ currentUrl: url });

    const { sessionToken, redirectFlowId, status } = this.props;
    if (status === "pending"
      && sessionToken != null
      && redirectFlowId != null
      && this.state.redirectUrl != null
      && url != null) {
      if (url.toLowerCase().includes(this.state.redirectUrl)) {
        this.completeRedirectFlow();
      }
    }
  }

  completeRedirectFlow() {
    const { api, auth, sessionToken, redirectFlowId } = this.props;
    alert("Start")

    fetch(`${api}/redirect_flows/${redirectFlowId}/actions/complete`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
        'GoCardless-Version': '2015-07-06'
      },
      body: JSON.stringify({
        data: {
          session_token: sessionToken,
        }
      }),
    }).then(response => {
      alert(JSON.stringify(response));
      return response.json();
    })
      .then(json => {
        const mandate = json.redirect_flows.links.mandate;
        const bankAccount = json.redirect_flows.links.customer_bank_account;
        const url = this.state.currentUrl;
        alert(url)

        const { onMandateAction } = this.props;
        if (onMandateAction) {
          onMandateAction(mandate, bankAccount, url);
        }
      })
  }

  render() {
    return (<Text>{this.state.currentUrl}</Text>);
  }
}
