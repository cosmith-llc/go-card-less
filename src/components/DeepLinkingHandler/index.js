import React, {useState, useEffect} from 'react';
import {Linking, StyleSheet, Text, View, Alert} from 'react-native';

const _date = Date.now();
const container = {
  visited: false
}; 

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
  console.log('useInitialURL:step1');
  const [url, setUrl] = useState(null);
  const [processing, setProcessing] = useState(true);

  console.log('useInitialURL:step2');
  useEffect(() => {
    console.log('useInitialURL:step3');
    const getUrlAsync = async () => {
      console.log('useInitialURL:step4', Linking.__someProperty);
      // Get the deep link used to open the app
      const initialUrl = await Linking.getInitialURL();
      Linking.__someProperty = true;
      console.log('useInitialURL:step5', Linking.__someProperty);
      // The setTimeout is just for testing purpose
      setTimeout(() => {
        console.log('useInitialURL:step6', initialUrl);
        setUrl(initialUrl);
        console.log('useInitialURL:step7');
        setProcessing(false);
        console.log('useInitialURL:step8', initialUrl);
        completeRedirectFlow(props, initialUrl);
        console.log('useInitialURL:step9');
      }, 100);
    };
    if (Linking && !Linking.__someProperty) { 
      getUrlAsync(); 
    }
  }, []);

  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      Linking.__someProperty = true;
      console.log('useInitialURL:step10', url);
      setUrl(url);
      console.log('useInitialURL:step11');
      setProcessing(false);
      console.log('useInitialURL:step12', url);
      completeRedirectFlow(props, url);
    };

    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      console.log('useInitialURL:remove', url);
      if (linkingSubscription && linkingSubscription.remove) {
        linkingSubscription.remove();
      }

      if (Linking && Linking.removeEventListener) {
        Linking.removeEventListener('url', handleDeepLink);
      }
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