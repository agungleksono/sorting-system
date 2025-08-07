import React, {useState, useRef, useEffect} from 'react';
import {
    View,
    TextInput,
    Button,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axiosInstance';

const LoginScreen = ({navigation}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const usernameInputRef = useRef(null);
    const passwordInputRef = useRef(null);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            setErrorMessage('Please enter both username and password.');
            return;
        }

        try {
            setLoading(true);

            const response = await api.post('/auth/login', {
                npk: username,
                password: password,
            });

            if (response.data.meta.code == '200') {
                const {user_id, name, npk} = response.data.data;

                await AsyncStorage.setItem('user_id', user_id);
                await AsyncStorage.setItem('name', name);
                await AsyncStorage.setItem('npk', npk);

                navigation.navigate('Menu');
            } else {
                setErrorMessage('NPK or Password incorrect.');
            }
        } catch (error) {
            console.error(error);
            setErrorMessage('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitUsername = () => {
        passwordInputRef.current?.focus();
    };

    useEffect(() => {
        usernameInputRef.current?.focus();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.appName}>Sorting System</Text>
            {/* <Text style={styles.header}>Login</Text> */}
            <TextInput
                ref={usernameInputRef}
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={(text) => {
                    setUsername(text);
                    setErrorMessage("");
                }}
                onSubmitEditing={handleSubmitUsername}
            />
            <TextInput
                ref={passwordInputRef}
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                    setPassword(text);
                    setErrorMessage("");
                }}
                onSubmitEditing={handleLogin}
                secureTextEntry
            />
            {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Login</Text>
                )}
            </TouchableOpacity>
            
            <Text style={styles.footer}>
                {'\u00A9'} 2025. Reserved by Denso Indonesia - QA
            </Text>
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
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    footer: {
        marginTop: 16,
        textAlign: 'center',
        fontSize: 12,
    },
});

export default LoginScreen;
