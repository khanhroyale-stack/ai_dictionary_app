import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { COLORS } from '../constants/colors';

// Screens
import AccountScreen from '../screens/Account/index.js';
import HomeScreen from '../screens/Home/index';
import LoginScreen from '../screens/Login/index';
import ProfileScreen from '../screens/Profile/index';
import UpdateProfileScreen from '../screens/Profile/UpdateProfile';
import ScanScreen from '../screens/Scan/index';
import ScannedWordsScreen from '../screens/ScannedWords/index';
import SettingsScreen from '../screens/Settings/index';
import WordDetailScreen from '../screens/WordDetail.js/index';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack for Home
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="WordDetail" component={WordDetailScreen} />
  </Stack.Navigator>
);

// Stack for ScannedWords
const ScannedWordsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ScannedWordsList" component={ScannedWordsScreen} />
    <Stack.Screen name="WordDetail" component={WordDetailScreen} />
  </Stack.Navigator>
);

// Stack for Account
const AccountStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AccountMain" component={AccountScreen} />
    <Stack.Screen name="ScannedWords" component={ScannedWordsScreen} />
    <Stack.Screen name="WordDetail" component={WordDetailScreen} />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: 'Cài đặt', headerShown: true }}
    />
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Tài khoản', headerShown: true }}
    />
    <Stack.Screen
      name="UpdateProfile"
      component={UpdateProfileScreen}
      options={{ title: 'Cập nhật thông tin', headerShown: true }}
    />
  </Stack.Navigator>
);

// Custom tab bar
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const tabs = [
    { icon: 'home-outline',          iconActive: 'home',          label: 'Trang chủ' },
    { icon: 'camera-outline',        iconActive: 'camera',        label: 'Quét' },
    { icon: 'list-outline',          iconActive: 'list',          label: 'Từ đã quét' },
    { icon: 'person-circle-outline', iconActive: 'person-circle', label: 'Tài khoản' },
  ];

  return (
    <View style={tabStyles.container}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tab = tabs[index];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={tabStyles.tab}
            onPress={onPress}
            activeOpacity={0.7}>
            <Ionicons
              name={isFocused ? tab.iconActive : tab.icon}
              size={22}
              color={isFocused ? COLORS.primary : COLORS.gray}
            />
            <Text style={[tabStyles.label, isFocused && tabStyles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: 16,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  label: { fontSize: 10, color: COLORS.gray, fontWeight: '500' },
  labelActive: { color: COLORS.primary, fontWeight: '700' },
});

// Main tab navigator
const MainNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Scan" component={ScanScreen} />
    <Tab.Screen name="ScannedWords" component={ScannedWordsStack} />
    <Tab.Screen name="Account" component={AccountStack} />
  </Tab.Navigator>
);

// Root navigator
const AppNavigator = () => {
  const { isAuthenticated } = useSelector((s) => s.settings);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;