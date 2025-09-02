import React, {useState, useEffect, useRef} from 'react';
import {
    View,
    TextInput,
    Button,
    Text,
    StyleSheet,
    Alert,
    Keyboard,
    ScrollView,
} from 'react-native';
import api from '../api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    AutocompleteDropdown,
    AutocompleteDropdownContextProvider,
} from 'react-native-autocomplete-dropdown';
import {printCustomLabel} from '../utils/labelPrint';

const ReprintScreen = ({navigation, route}) => {
    const {caseData} = route.params;
    const scanInputRef = useRef(null);
    const [qrCode, setQrCode] = useState('');
    const [error, setError] = useState('');
    const [isSuspect, setIsSuspect] = useState('');
    const [judgmentState, setJudgmentState] = useState({
        judgment: false,
        message: '',
        color: '',
    });
    const [result, setResult] = useState({
        isResultVisible: false,
        partNo: '',
        scanParamTitle: '',
        scanParamValue: '',
    });
    // Define the dataset for scan parameter
    const scanParameters = [
        {id: 'PART_NO', title: 'Part No'},
        {id: 'LOT_NO', title: 'Lot No'},
        {id: 'INVOICE_NO', title: 'Invoice No'},
        {id: 'BOX_NO', title: 'Box Id'},
    ];

    const handleSubmit = async () => {
        try {
            setError('');

            if (qrCode == '') {
                setError('Data QR tidak boleh kosong.');
                setQrCode('');
                return;
            }

            const {data} = await api.post('/reprint', {
                qr_code: qrCode,
                suspect_case_id: caseData.suspect_case_id,
            });

            data.data.is_suspect ? showNgAlert() : showOkAlert();

            setIsSuspect(data.data.is_suspect);
            setQrCode('');
            setResult({
                isResultVisible: true,
                partNo: data.data.part_no,
                scanParamTitle:
                    scanParameters.find(
                        item => item.id === caseData.scan_parameter_code,
                    )?.title || '-', // Get scan parameter untuk ditampilkan di result
                scanParamValue: data.data.search_value,
            });
            scanInputRef.current?.focus();
            printCustomLabel({
                judgment: data.data.is_suspect ? 'NG' : 'OK',
                partNo: data.data.part_no,
            });
        } catch (err) {
            if (err.response) {
                const { status, data } = err.response;

                if (status === 404) {
                    setJudgmentState(prevState => ({
                        ...prevState,
                        judgment: false,
                    }));
                    setResult(prevState => ({
                        ...prevState,
                        isResultVisible: false,
                    }));
                    setQrCode('');
                    scanInputRef.current.focus();
                    return Alert.alert('Reprint Gagal!', 'QR tidak ditemukan!');
                }

                // Optionally handle other errors like 400, 401, 500, etc.
                Alert.alert('Terjadi Kesalahan', `(${status}) ${data?.message || 'Unknown error'}`);
            } else {
                // No response from server
                console.error('Error handleSubmit():', err);
                Alert.alert('Network Error', 'Tidak dapat terhubung ke server.');
            }
        }
    };

    /* Function to show OK alert with green color */
    const showOkAlert = () => {
        setJudgmentState({
            judgment: true,
            message: 'OK',
            color: 'green',
        });
    };

    /* Function to show NG alert with red color */
    const showNgAlert = () => {
        setJudgmentState({
            judgment: true,
            message: 'NG',
            color: 'red',
        });
    };

    useEffect(() => {
        scanInputRef.current?.focus();
    }, []);

    return (
        <AutocompleteDropdownContextProvider>
            <ScrollView contentContainerStyle={{flexGrow: 1}} style={{flex: 1}}>
                <View style={styles.container}>
                    <TextInput
                        ref={scanInputRef}
                        style={styles.input}
                        placeholder="Scan QR Code"
                        value={qrCode}
                        onChangeText={setQrCode}
                        onSubmitEditing={handleSubmit}
                    />

                    {/* Error Message */}
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Result Component */}
                    {result.isResultVisible && (
                        <View
                            style={[
                                styles.resultContainer,
                                {
                                    backgroundColor: isSuspect
                                        ? '#f8d7da'
                                        : '#d4edda',
                                    borderColor: isSuspect ? 'red' : '#28a745',
                                },
                            ]}>
                            <Text
                                style={[
                                    styles.resultText,
                                    {
                                        color: isSuspect ? 'red' : '#28a745',
                                        fontSize: 16,
                                    },
                                ]}>
                                {isSuspect
                                    ? 'Found Suspect Part!'
                                    : 'Suspect Part Not Found.'}
                            </Text>
                            <Text
                                style={[
                                    styles.resultText,
                                    {color: isSuspect ? 'red' : '#28a745'},
                                ]}>
                                Part No. : {result.partNo}
                            </Text>
                            <Text
                                style={[
                                    styles.resultText,
                                    {color: isSuspect ? 'red' : '#28a745'},
                                ]}>
                                {result.scanParamTitle} :{' '}
                                {result.scanParamValue}
                            </Text>
                        </View>
                    )}

                    {judgmentState.judgment && (
                        <View
                            style={[
                                styles.squareAlert,
                                {backgroundColor: judgmentState.color},
                            ]}>
                            <Text style={styles.alertText}>
                                {judgmentState.message}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </AutocompleteDropdownContextProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        // justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        width: '100%',
        marginBottom: 10,
        paddingLeft: 8,
        borderRadius: 4,
    },
    autocomplete: {
        width: '100%',
        marginBottom: 10,
    },

    /* Alert styles */
    squareAlert: {
        width: 300,
        height: 300,
        // backgroundColor: '#5CB338', // Background color for the alert
        // backgroundColor: '#E52020', // Background color for the alert
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginTop: 15,
    },
    alertText: {
        fontSize: 80,
        color: 'white',
        fontWeight: 'bold',
    },
    alertSubText: {
        fontSize: 22,
        color: 'white',
        fontWeight: 'bold',
    },

    /* Result Alert styles */
    resultContainer: {
        width: '100%',
        paddingVertical: 8,
        marginTop: 8,
        // backgroundColor: '#f8d7da',
        borderRadius: 5,
        borderWidth: 1,
        // borderColor: 'red',
        alignItems: 'center',
    },
    resultText: {
        color: 'red',
        fontSize: 12,
        fontWeight: 'bold',
    },

    /* Error styles */
    errorContainer: {
        width: '100%',
        padding: 10,
        marginTop: 5,
        backgroundColor: '#f8d7da',
        borderRadius: 5,
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default ReprintScreen;
