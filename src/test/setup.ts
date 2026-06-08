import "react-native-gesture-handler/jestSetup";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("@expo/vector-icons", () => ({
	FontAwesome5: () => null,
}));

jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const { View, ScrollView } = require("react-native");
  const BottomSheet = React.forwardRef(({ children, snapPoints, onChange }: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      snapToIndex: jest.fn(),
      close: jest.fn(),
    }));
    return React.createElement(View, { testID: "mock-bottom-sheet" }, children);
  });
  return {
    __esModule: true,
    default: BottomSheet,
    BottomSheetScrollView: ({ children, contentContainerStyle }: any) =>
      React.createElement(ScrollView, { contentContainerStyle }, children),
  };
});


jest.mock("@react-navigation/native-stack", () => {
	const stack = jest.requireActual("@react-navigation/stack");
	return {
		createNativeStackNavigator: stack.createStackNavigator,
	};
});

jest.mock("react-native-reanimated", () => {
	const Reanimated = jest.requireActual("react-native-reanimated/mock");
	Reanimated.default.call = () => {};
	return Reanimated;
});

jest.mock("react-native-safe-area-context", () => {
	const React = require("react");
	const inset = { top: 0, right: 0, bottom: 0, left: 0 };
	const SafeAreaContext = React.createContext(inset);
	const SafeAreaInsetsContext = SafeAreaContext;
	return {
		SafeAreaProvider: ({ children }: any) => children,
		SafeAreaView: ({ children }: any) => children,
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
	class MockPicker extends React.Component {
		static Item = (props: any) => React.createElement("PickerItem", props);
		render() {
			return React.createElement("Picker", this.props, this.props.children);
		}
	}
	return {
		Picker: MockPicker,
	};
});
