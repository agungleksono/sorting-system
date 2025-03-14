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

const ScanV2Screen = ({navigation, route}) => {
    const {caseData} = route.params;
    const scanInputRef = useRef(null);
    const [qrCode, setQrCode] = useState('');
    const [error, setError] = useState('');
    const [isJudgmentVisible, setIsJudgmentVisible] = useState(false);
    const [isSuspect, setIsSuspect] = useState('');
    const [judgmentState, setJudgmentState] = useState({
        message: '',
        color: '',
    });
    const [scanProgress, setScanProgress] = useState({
        currentProgress: '',
        maxProgress: '',
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
            // Check qr content length
            if (qrCode.length != caseData.qr_length) {
                setError('QR tidak sesuai, silahkan scan lagi.');
                setQrCode('');
                // Use setTimeout to ensure focus happens after state update
                setTimeout(() => {
                    scanInputRef.current.focus();
                }, 0);
                return;
            }

            const npk = await AsyncStorage.getItem('npk');
            const {data} = await api.post('/scan', {
                scan_parameter: caseData.scan_parameter_code,
                qr_code: qrCode,
                scanned_by: npk,
            });

            if (data.meta.code === 422) {
                setIsJudgmentVisible(false);
                setQrCode('');
                scanInputRef.current.focus();
                return Alert.alert('Scan Gagal!', 'QR sudah discan!');
            }

            data.data.is_suspect ? showNgAlert() : showOkAlert();
            // data.data.is_suspect === true ? showNgAlert() : showOkAlert();

            setIsSuspect(data.data.is_suspect);
            getScanProgress();
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
        } catch (error) {
            console.error('Error handleSubmit():', error);
        }
    };

    /* Function to show OK alert with green color */
    const showOkAlert = () => {
        setJudgmentState({
            message: 'OK',
            color: 'green',
        });
        setIsJudgmentVisible(true);
    };

    /* Function to show NG alert with red color */
    const showNgAlert = () => {
        setJudgmentState({
            message: 'NG',
            color: 'red',
        });
        setIsJudgmentVisible(true);
    };

    const getScanProgress = async () => {
        try {
            const {data} = await api.get(
                `/scan/progress/${caseData.suspect_case_id}`,
            );

            if (data.meta.code == '200') {
                setScanProgress({
                    currentProgress: data.data.current_progress,
                    maxProgress: data.data.max_progress,
                });
            }
        } catch (error) {
            console.error('Error getScanProgress():', error);
        }
    };

    useEffect(() => {
        scanInputRef.current?.focus();
        getScanProgress();
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

                    <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>
                            Scan Progress :{' '}
                        </Text>
                        <Text
                            style={[styles.progressText, styles.progressBadge]}>
                            {scanProgress.currentProgress} /{' '}
                            {scanProgress.maxProgress}
                        </Text>
                    </View>

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

                    {/* <View></View> */}

                    {isJudgmentVisible && (
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

    /* Progress scan styles */
    progressContainer: {
        flexDirection: 'row', // This arranges the child elements side by side
        alignItems: 'center', // Vertically center the items if needed
        marginTop: 3,
    },
    progressText: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    progressBadge: {
        borderRadius: 4,
        backgroundColor: 'lightblue',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
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

export default ScanV2Screen;
