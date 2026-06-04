import "react-native-gesture-handler/jestSetup";

jest.mock("@expo/vector-icons", () => ({
	FontAwesome5: () => null,
}));

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
