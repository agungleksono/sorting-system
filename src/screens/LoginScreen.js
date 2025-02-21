import React, {useState} from 'react';
import {View, TextInput, Button, Text, StyleSheet, Alert} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axiosInstance';

const LoginScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // const handleLogin = async () => {
  //   // if (username === 'user' && password === 'password') {
  //   //   Alert.alert('Login Successful!', 'You are now logged in');
  //   //   navigation.navigate('Scan'); // Navigate to Home screen after successful login
  //   // } else {
  //   //   Alert.alert('Error', 'Invalid username or password');
  //   // }
  //   try {
  //     // Configure Axios headers with Bearer token
  //     const config = {
  //       headers: {
  //         Authorization: `Bearer tt793cqBV3JffiVbm4sVOJ33ghcXB5IrWiFTo4oRsgIq9LPZpUU31bpBLjWjECGj`, // Pass Bearer token in the headers
  //       },
  //     };

  //     const response = await axios.post(
  //       'http://192.168.10.151:8000/api/v1/auth/login',
  //       {
  //         npk: username,
  //         password: password,
  //       },
  //       config,
  //     );

  //     if (response.data.meta.status === 'success') {
  //       const {user_id, name, npk} = response.data.data;

  //       await AsyncStorage.setItem('user_id', user_id);
  //       await AsyncStorage.setItem('name', name);
  //       await AsyncStorage.setItem('npk', npk);

  //       console.log(response.data);
  //       navigation.navigate('Scan');
  //     } else {
  //       setErrorMessage('NPK or Password incorrect.');
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     setErrorMessage('Something went wrong. Please try again.');
  //   }
  // };

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', {
        npk: username,
        password: password,
      });

      if (response.data.meta.code == '200') {
        const {user_id, name, npk} = response.data.data;

        await AsyncStorage.setItem('user_id', user_id);
        await AsyncStorage.setItem('name', name);
        await AsyncStorage.setItem('npk', npk);

        console.log(response.data);
        navigation.navigate('Menu');
      } else {
        setErrorMessage('NPK or Password incorrect.');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Sorting System</Text>
      <Text style={styles.header}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      <Button title="Login" onPress={handleLogin} />
      {/* <Text style={styles.footer}>
        Don't have an account? <Text style={styles.link}>Sign Up</Text>
      </Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  appName: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    borderRadius: 4,
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
  },
  //   footer: {
  //     marginTop: 16,
  //     textAlign: 'center',
  //     fontSize: 16,
  //   },
  //   link: {
  //     color: 'blue',
  //   },
});

export default LoginScreen;
