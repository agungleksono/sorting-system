import React, {useState, useEffect, useRef} from 'react';
import {View, TextInput, Button, Text, StyleSheet, Alert} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import api from '../api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    AutocompleteDropdown,
    AutocompleteDropdownContextProvider,
} from 'react-native-autocomplete-dropdown';

const ScanScreen = ({navigation}) => {
    const scanInputRef = useRef(null);
    // const [partNo, setPartNo] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [partNoList, setPartNoList] = useState(null);
    // const [lotNo, setLotNo] = useState('');
    const [scanParameter, setScanParameter] = useState('');
    const [error, setError] = useState('');

    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isJudgmentVisible, setIsJudgmentVisible] = useState(false);
    const [judgmentState, setJudgmentState] = useState({
        message: '',
        color: '',
    });

    // const [selectedItem, setSelectedItem] = useState(null);
    const [selectedPartNo, setSelectedPartNo] = useState(null);
    const [quantity, setQuantity] = useState('');

    const handleSubmit = async () => {
        let hasError = false;

        if (!scanParameter) setError('Scan Gagal! Scan Parameter harus diisi.');
        else if (!selectedPartNo) setError('Scan Gagal! Part No harus diisi.');
        else if (!quantity) setError('Scan Gagal! Quantity harus diisi.');
        else if (!qrCode) setError('Gagal! Scan QR terlebih dahulu.');

        const npk = await AsyncStorage.getItem('npk');

        const response = await api.post('/scan', {
            // part_no: partNo,
            qr_code: qrCode,
            scan_parameter: scanParameter,
            scanned_by: npk,
        });
        console.log(response);
        return;

        // Check is qr code already scanned or not
        if (response.data.meta.code === 422) {
            setIsJudgmentVisible(false);
            setQrCode('');
            scanInputRef.current.focus();
            return Alert.alert('Scan Gagal!', 'QR sudah discan!');
        }

        // if (response.data.data.is_suspect === true) {
        //   showNgAlert();
        // } else {
        //   showOkAlert();
        // }

        response.data.data.is_suspect === true ? showNgAlert() : showOkAlert();
    };

    const getPartNo = async () => {
        try {
            const response = await api.get('/scan/part-no');

            if (response.data.meta.code == '200') {
                // setOptions(response.data.data.part_no);
                const ressData = response.data.data.part_no;
                const partNo = ressData.map(item => ({id: item, title: item}));
                setPartNoList(partNo);
            }
        } catch (err) {
            console.error('Error fetching data getPartNo():', err);
        } finally {
            setLoading(false);
        }
    };

    // Function to show OK alert with green color
    const showOkAlert = () => {
        setJudgmentState({
            message: 'OK',
            color: 'green',
        });
        setIsJudgmentVisible(true);
    };

    // Function to show NG alert with red color
    const showNgAlert = () => {
        setJudgmentState({
            message: 'NG',
            color: 'red',
        });
        setIsJudgmentVisible(true);
    };

    const handleSelectScanParameter = item => {
        // item contains the selected object
        if (item) {
            setScanParameter(item.id);
        }
    };

    // Call getPartNo when the component mounts
    useEffect(() => {
        scanInputRef.current?.focus();
        getPartNo();
    }, []);

    return (
        <AutocompleteDropdownContextProvider>
            <View style={styles.container}>
                {/* <Text style={styles.title}>Select Part No.: {selectedValue}</Text> */}

                {/* <Picker
          selectedValue={scanParameter}
          onValueChange={itemValue => setScanParameter(itemValue)}
          style={styles.picker}>
          <Picker.Item label="Pilih Scan Parameter" value="" />
          <Picker.Item label="Part No" value="part_no" />
          <Picker.Item label="Lot No" value="lot_no" />
          <Picker.Item label="Invoice No" value="invoice_no" />
          <Picker.Item label="Box Id" value="box_id" />
        </Picker> */}

                {/* <Picker
        selectedValue={partNo}
        onValueChange={itemValue => setPartNo(itemValue)}
        style={styles.picker}>
        <Picker.Item label="Select Part No." value="" />
        {loading ? (
          <Picker.Item label="Loading..." value="" />
        ) : (
          options.map((option, index) => (
            <Picker.Item key={index} label={option} value={option} />
          ))
        )}
      </Picker> */}

                <AutocompleteDropdown
                    clearOnFocus={false}
                    closeOnBlur={true}
                    closeOnSubmit={false}
                    onSelectItem={handleSelectScanParameter}
                    dataSet={[
                        {id: 'part_no', title: 'Part No'},
                        {id: 'lot_no', title: 'Lot No'},
                        {id: 'invoice_no', title: 'Invoice No'},
                        {id: 'box_id', title: 'Box Id'},
                    ]}
                    containerStyle={styles.autocomplete}
                    textInputProps={{
                        placeholder: 'Pilih Scan Parameter...',
                    }}
                />

                <AutocompleteDropdown
                    clearOnFocus={false}
                    closeOnBlur={true}
                    closeOnSubmit={false}
                    onSelectItem={setSelectedPartNo}
                    dataSet={partNoList}
                    containerStyle={styles.autocomplete}
                    textInputProps={{
                        placeholder: 'Pilih Part Number...',
                    }}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Quantity"
                    value={qrCode}
                    onChangeText={setQrCode}
                />

                <TextInput
                    ref={scanInputRef}
                    style={styles.input}
                    placeholder="Scan QR Code"
                    value={qrCode}
                    onChangeText={setQrCode}
                    onSubmitEditing={handleSubmit}
                    // multiline={true}
                    // numberOfLines={4}
                    // textAlignVertical="top"
                    // returnKeyType="done"
                />

                {/* Error Message */}
                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                <View style={styles.rowContainer}>
                    <Text style={styles.progressText}>Scan Progress : </Text>
                    <Text style={[styles.progressText, styles.progressBadge]}>
                        45 / 1843
                    </Text>
                </View>

                {isJudgmentVisible && (
                    <View
                        style={[
                            styles.squareAlert,
                            {backgroundColor: judgmentState.color},
                        ]}>
                        {/* {judgmentState.message === 'NG' && (
            <>
              <Text style={styles.alertSubText}>Part No: JK12345-1234</Text>
              <Text style={styles.alertSubText}>Lot No: whri234we</Text>
            </>
          )} */}
                        <Text style={styles.alertText}>
                            {judgmentState.message}
                        </Text>
                    </View>
                )}
            </View>
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
    // title: {
    //   fontSize: 16,
    //   marginBottom: 10,
    // },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        width: '100%',
        marginBottom: 12,
        paddingLeft: 8,
        borderRadius: 4,
    },
    textArea: {
        height: 100,
        borderColor: '#ccc',
        borderWidth: 1,
        width: '100%',
        borderRadius: 4,
    },
    picker: {
        height: 50,
        width: '100%',
        borderColor: '#ccc', // Border color for the Picker
        borderWidth: 1, // Border width for the Picker
        borderRadius: 5, // Optional: Adds rounded corners to the border
        marginBottom: 20,
    },
    autocomplete: {
        width: '100%',
        marginBottom: 10,
    },

    squareAlert: {
        width: 300,
        height: 300,
        // backgroundColor: '#5CB338', // Background color for the alert
        // backgroundColor: '#E52020', // Background color for the alert
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginTop: 20,
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
    rowContainer: {
        flexDirection: 'row', // This arranges the child elements side by side
        alignItems: 'center', // Vertically center the items if needed
        marginTop: 7,
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

export default ScanScreen;
