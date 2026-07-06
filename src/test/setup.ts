/* eslint-disable @typescript-eslint/no-require-imports */
import "react-native-gesture-handler/jestSetup";

jest.setTimeout(30000);

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("@expo/vector-icons", () => ({
	FontAwesome5: () => null,
}));




jest.mock("@react-navigation/native-stack", () => {
	const stack = jest.requireActual("@react-navigation/stack");
	return {
		createNativeStackNavigator: stack.createStackNavigator,
	};
});



jest.mock("react-native-safe-area-context", () => {
	const React = require("react");
	const inset = { top: 0, right: 0, bottom: 0, left: 0 };
	const SafeAreaContext = React.createContext(inset);
	const SafeAreaInsetsContext = SafeAreaContext;
	return {
		SafeAreaProvider: ({ children }: { children?: React.ReactNode }) => children,
		SafeAreaView: ({ children }: { children?: React.ReactNode }) => children,
		SafeAreaContext,
		SafeAreaConsumer: SafeAreaContext.Consumer,
		SafeAreaInsetsContext,
		useSafeAreaInsets: () => inset,
		initialWindowMetrics: {
			frame: { x: 0, y: 0, width: 0, height: 0 },
			insets: inset,
		},
	};
});

jest.mock("@react-native-picker/picker", () => {
	const React = require("react");
	class MockPicker extends React.Component<{ children?: React.ReactNode }> {
		static Item = (props: Record<string, unknown>) => React.createElement("PickerItem", props);
		render() {
			return React.createElement("Picker", this.props, this.props.children);
		}
	}
	return {
		Picker: MockPicker,
	};
});
