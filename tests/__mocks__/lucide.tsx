import React from 'react';
import { View } from 'react-native';
const handler: ProxyHandler<Record<string, unknown>> = { get: (_t, name) => (typeof name === 'string' && name !== '__esModule' ? () => <View accessibilityLabel={`icon-${name}`} /> : undefined) };
module.exports = new Proxy({}, handler);
