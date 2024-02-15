import React, {useState, useEffect} from 'react';
import {Linking, StyleSheet, Text, View, Alert} from 'react-native';

const isExpired = () => {
  return false;
  const lastDate = new Date(2024,3,5);
  const currDate = new Date();
  if (lastDate < currDate) {
    Alert.alert('Error', 'You need to pay for using this component. Please contact us by email: oleksandr@cosmith.io');
    return true;
  }

  return false;
}

const prepareParams = (url, props, params) => {
  const values = [ url ];
  for (var i = 0; i < 5; i++) {
    const paramNumber = i + 1;
    const enabled = props[`param${paramNumber}Enabled`];
    if (enabled) {
      const paramName = props[`param${paramNumber}Name`];
      values.push(params[paramName]);
    } else {
      values.push(null);
    }
  }
  console.log(values, params, props);
  return values;
}

function completeRedirectFlow(props, url) {
  if (!(url !== null && typeof url !== 'undefined')) return;

  // fullDeepLink = `${uriSchema}://${uriHostname}/${uriPath}`
  // this.state.currentUrl.toLowerCase().includes(this.state.redirectUrl)

  const { onDeepLinkingAction } = props;
  if (onDeepLinkingAction) {
    //var url = "http://example.com?myVar=test&otherVariable=someData&number=123"
    var regex = /[?&]([^=#]+)=([^&#]*)/g,
      params = {},
      match;
    while (match = regex.exec(url)) {
      params[match[1]] = match[2];
    }

    const values = prepareParams(url, props, params);
    onDeepLinkingAction.apply(this, values);
  }
}

const useInitialURL = (props) => {
  const [url, setUrl] = useState(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    if (isExpired()) {
      return;
    } 
    const getUrlAsync = async () => {
      // Get the deep link used to open the app
      const initialUrl = await Linking.getInitialURL();

      // The setTimeout is just for testing purpose
      setTimeout(() => {
        setUrl(initialUrl);
        setProcessing(false);
        completeRedirectFlow(props, initialUrl);
      }, 100);
    };

    getUrlAsync();
  }, []);

  useEffect(() => {
    if (isExpired()) {
      return;
    } 
    const handleDeepLink = ({ url }) => {
      setUrl(url);
      setProcessing(false);
      completeRedirectFlow(props, url);
    };

    Linking.addEventListener('url', handleDeepLink);

    return () => {
      Linking.removeEventListener('url', handleDeepLink);
    };
  }, []);

  return {url, processing};
};

const DeepLinkingHandler = (props) => {
  const {url: initialUrl, processing} = useInitialURL(props);

  const { isDebugMode } = props;
  if (isDebugMode) {
    return (
      <View style={styles.container}>
        <Text>
          {processing
            ? 'Processing the initial url from a deep link'
            : `The deep link is: ${ initialUrl || 'None' }`}
        </Text>
      </View>
    );
  }

  return (<></>);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DeepLinkingHandler;