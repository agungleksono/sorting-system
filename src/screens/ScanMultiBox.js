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
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import api from '../api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    AutocompleteDropdown,
    AutocompleteDropdownContextProvider,
} from 'react-native-autocomplete-dropdown';
import {printLabel} from '../utils/print';

const ScanMultiBox = ({navigation, route}) => {
    const {caseData} = route.params;
    const scanInputRef = useRef(null);
    const [qrCode, setQrCode] = useState('');
    const [quantity, setQuantity] = useState('');
    const [error, setError] = useState('');
    const [isSuspect, setIsSuspect] = useState('');
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [judgment, setJudgment] = useState({ visible: false, message: '', color: '' });
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

            // Check quantity
            if (quantity == '') {
                setError('Isi quantity terlebih dahulu.');
                setQrCode('');
                return;
            }

            // Check qr content length
            // if (qrCode.length != caseData.qr_length) {
            //     setError('QR tidak sesuai, silahkan scan lagi.');
            //     setQrCode('');
            //     // Use setTimeout to ensure focus happens after state update
            //     setTimeout(() => {
            //         scanInputRef.current.focus();
            //     }, 0);
            //     return;
            // }

            const npk = await AsyncStorage.getItem('npk');
            const {data} = await api.post('/scan/multi-box', {
                scan_parameter: caseData.scan_parameter_code,
                qr_code: qrCode,
                suspect_case_id: caseData.suspect_case_id,
                scanned_by: npk,
                progress_quantity: quantity,
            });

            if (data.meta.code === 422) {
                setQrCode('');
                setResult(prevState => ({
                    ...prevState,
                    isResultVisible: false,
                }));
                setJudgment(prevState => ({
                    ...prevState,
                    visible: false,
                }));
                scanInputRef.current.focus();
                return Alert.alert('Scan Gagal!', 'QR sudah discan!');
            }

            data.data.is_suspect ? showNgAlert() : showOkAlert();

            setIsSuspect(data.data.is_suspect);
            getScanProgress();
            setQuantity('');
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
            printLabel({
                mainText: data.data.is_suspect ? 'NG' : 'OK',
                partNo: data.data.part_no,
            });
        } catch (err) {
            // Axios error with response
            if (err.response) {
                const { status, data } = err.response;

                if (status === 422) {
                    // setIsJudgmentVisible(false);
                    setJudgment(prev => ({ ...prev, visible: false }));
                    setQrCode('');
                    setResult(prev => ({
                        ...prev,
                        isResultVisible: false,
                    }));
                    scanInputRef.current?.focus();
                    return Alert.alert('Scan Gagal!', 'QR sudah discan!');
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
        setJudgment({
            visible: true,
            message: 'OK',
            color: 'green',
        });
    };

    /* Function to show NG alert with red color */
    const showNgAlert = () => {
        setJudgment({
            visible: true,
            message: 'NG',
            color: 'red',
        });
    };

    /* Judgment Component */
    const JudgmentAlert = ({ visible, message, color }) =>
        visible ? (
            <View style={[styles.squareAlert, { backgroundColor: color }]}>
                <Text style={styles.alertText}>{message}</Text>
            </View>
        ) : null;

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

    // Add the three dots button in the header using headerRight
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={styles.headerButton}>
                    <Text style={styles.headerButtonText}>...</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    // Handle menu actions
    const handleMenuReprint = () => {
        // console.log(`Selected action: ${action}`);
        navigation.navigate('Reprint', {caseData: caseData});
        setMenuVisible(false); // Close the menu after an action is selected
        // Add logic for different actions here (e.g., Edit, Delete, etc.)
    };

    const handleMenuListSuspect = () => {
        console.log(caseData);
        navigation.navigate('ListSuspect', {caseData: caseData});
        setMenuVisible(false);
    };

    return (
        <AutocompleteDropdownContextProvider>
            <ScrollView contentContainerStyle={{flexGrow: 1}} style={{flex: 1}}>
                <View style={styles.container}>
                    <TextInput
                        style={styles.input}
                        placeholder="Quantity"
                        value={quantity}
                        onChangeText={setQuantity}
                    />
                    <TextInput
                        ref={scanInputRef}
                        style={styles.input}
                        placeholder="Scan QR Code"
                        value={qrCode}
                        onChangeText={setQrCode}
                        onSubmitEditing={handleSubmit}
                        showSoftInputOnFocus={false} // ✅ disables keyboard
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

                    <JudgmentAlert
                        visible={judgment.visible}
                        message={judgment.message}
                        color={judgment.color}
                    />

                    {/* Dropdown Menu Modal */}
                    {isMenuVisible && (
                        <Modal
                            transparent={true}
                            animationType="fade"
                            visible={isMenuVisible}
                            onRequestClose={() => setMenuVisible(false)}>
                            <TouchableWithoutFeedback
                                onPress={() => setMenuVisible(false)}>
                                <View style={styles.modalBackground}>
                                    <View style={styles.menuContainer}>
                                        <TouchableOpacity
                                            onPress={handleMenuReprint}
                                            style={styles.menuItem}>
                                            <Text style={styles.menuText}>
                                                Re-Print
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleMenuListSuspect}
                                            style={styles.menuItem}>
                                            <Text style={styles.menuText}>
                                                List Suspect
                                            </Text>
                                        </TouchableOpacity>
                                        {/* <TouchableOpacity
                                            onPress={() =>
                                                handleMenuAction('Action 3')
                                            }
                                            style={styles.menuItem}>
                                            <Text style={styles.menuText}>
                                                Action 3
                                            </Text>
                                        </TouchableOpacity> */}
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal>
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

    // Style 3 dots navigation bar button
    headerButton: {
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: 'transparent',
    },
    headerButtonText: {
        fontSize: 30,
        color: '#000',
    },

    // Style modal navigation bar button
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    menuContainer: {
        width: 200,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 5,
    },
    menuItem: {
        padding: 15,
    },
    menuText: {
        fontSize: 16,
        color: '#000',
    },
});

export default ScanMultiBox;
