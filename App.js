import * as React from 'react';
// import {View, TextInput, Button, Text, StyleSheet, Alert} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import ScanScreen from './src/screens/ScanScreen';
import ScanV2Screen from './src/screens/ScanV2Screen';
import MenuScreen from './src/screens/MenuScreen';

const Stack = createNativeStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{headerShown: false}}
                />
                <Stack.Screen name="Menu" component={MenuScreen} />
                <Stack.Screen name="Scan" component={ScanScreen} />
                <Stack.Screen name="ScanV2" component={ScanV2Screen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
