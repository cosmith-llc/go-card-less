import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

const _date = Date.now();
const container = {
  visited: false
};

const prepareParams = (url, props, params) => {
  const values = [url];
  for (var i = 0; i < 20; i++) {
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

  const { onDeepLinkingAction } = props;
  if (onDeepLinkingAction) {
    setTimeout(() => {
      let regex = /[?&]([^=#]+)=([^&#]*)/g,
        params = {},
        match;
      while (match = regex.exec(url)) {
        params[match[1]] = decodeURIComponent(match[2]);
      }
      const values = prepareParams(url, props, params);
      onDeepLinkingAction.apply(this, values);
    }, 200)
  }
}

const useInitialURL = (props) => {
  console.log('useInitialURL:step1');
  const [url, setUrl] = useState(null);
  const [processing, setProcessing] = useState(true);
  console.log('useInitialURL:step2');

  if (!Linking.__handledUrls) {
    console.log('useInitialURL:step3');
    Linking.__handledUrls = new Set();
  }

  useEffect(() => {
    const getUrlAsync = async () => {
      logger.info(Linking.__latestUrlChecked);
      if (!Linking.__latestUrlChecked) {
        const initialUrl = await Linking.getInitialURL();
        console.log(initialUrl);
        Linking.__latestUrl = initialUrl;
        Linking.__latestUrlChecked = true;
      }

      const initialUrl = Linking.__latestUrl;
      console.log('useInitialURL:step4', Linking.__latestUrl);
      Linking.__someProperty = true;
      console.log('useInitialURL:step5', Linking.__someProperty);

      setTimeout(() => {
        console.log('useInitialURL:step6', initialUrl);
        setUrl(initialUrl);
        setProcessing(false);
        console.log('useInitialURL:step8', initialUrl);

        if (initialUrl) {
          !Linking.__handledUrls.has(initialUrl) && Linking.__handledUrls.add(initialUrl);
          completeRedirectFlow(props, initialUrl);
        }

        console.log('useInitialURL:step9');
      }, 100);
    };

    if (Linking.__latestUrl) {
      setUrl(Linking.__latestUrl);
      setProcessing(false);

      if (!Linking.__handledUrls.has(Linking.__latestUrl)) {
        Linking.__handledUrls.add(Linking.__latestUrl);
        completeRedirectFlow(props, Linking.__latestUrl);
      }
    } else if (Linking && !Linking.__someProperty) {
      getUrlAsync();
    }
  }, []);

  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      Linking.__latestUrl = url;
      Linking.__someProperty = true;
      console.log('useInitialURL:step10', url);
      setUrl(url);
      console.log('useInitialURL:step11');
      setProcessing(false);

      if (url && !Linking.__handledUrls.has(url)) {
        console.log('useInitialURL:step12', url);
        Linking.__handledUrls.add(url);
        completeRedirectFlow(props, url);
      }
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

  return { url, processing };
};

const DeepLinkingHandler = (props) => {
  const { url: initialUrl, processing } = useInitialURL(props);

  const { isDebugMode } = props;
  if (isDebugMode) {
    return (
      <View style={styles.container}>
        <Text>
          {processing
            ? 'Processing the initial url from a deep link'
            : `The deep link is: ${initialUrl || 'None'}`}
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
