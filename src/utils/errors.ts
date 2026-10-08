export const errors = {
  hook: (hookName: string, providerName: string): string =>
    `[react-native-arc-ui] ${hookName} must be used inside <${providerName}>. ` +
    `Make sure your app is wrapped with <ARCUI> at the root level. ` +
    `Example: <ARCUI theme="system"><App /></ARCUI>`,

  prop: (componentName: string, propName: string, message: string): string =>
    `[react-native-arc-ui] <${componentName}> — invalid "${propName}" prop. ${message}`,

  token: (tokenPath: string): string =>
    `[react-native-arc-ui] Token "${tokenPath}" is undefined. ` +
    `Check your tokens configuration.`,
};
