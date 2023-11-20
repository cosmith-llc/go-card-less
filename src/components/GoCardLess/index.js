import React, { Component } from 'react';
import { Text, View } from 'react-native';

export default class GoCardLess extends Component {
  render() {
    const { _height, _width } = this.props

    return (
      <View style={{ height: _height, width: _width }}>
        <Text>GoCardLess</Text>
      </View>
    )
  }
}
