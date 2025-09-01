import React, {useState, useEffect} from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TouchableWithoutFeedback,
    Alert,
    ActivityIndicator,
} from 'react-native';
import api from '../../api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateScreen = ({navigation}) => {
    // State for form fields
    const [caseTitle, setCaseTitle] = useState('');
    const [selectedScanType, setSelectedScanType] = useState('');
    const [selectedScanParameter, setSelectedScanParameter] = useState('');
    const [scanQrText, setScanQrText] = useState('');
    const [qrCharacterLength, setQrCharacterLength] = useState('0');
    const [loading, setLoading] = useState(false);
    
    // State for dropdown modals
    const [scanTypeModalVisible, setScanTypeModalVisible] = useState(false);
    const [scanParameterModalVisible, setScanParameterModalVisible] = useState(false);
    
    // Options for dropdowns
    const scanTypeOptions = [
        { id: '001', label: 'Single Box Data' },
        { id: '002', label: 'Multiple Box Data' }
    ];
    
    const scanParameterOptions = [
        { id: 'BOX_NO', label: 'Box No' },
        { id: 'INVOICE_NO', label: 'Invoice No' },
        { id: 'LOT_NO', label: 'Lot No' },
        { id: 'PART_NO', label: 'Part No' }
    ];

    // Auto-calculate QR character length when scanQrText changes
    useEffect(() => {
        const cleanedText = scanQrText.replace(/\n/g, ''); // remove all newlines
        setQrCharacterLength(cleanedText.length.toString());
    }, [scanQrText]);

    const handleScanTypeSelect = (option) => {
        setSelectedScanType(option);
        setScanTypeModalVisible(false);
    };

    const handleScanParameterSelect = (option) => {
        setSelectedScanParameter(option);
        setScanParameterModalVisible(false);
    };

    const handleSubmit = async () => {
        // Validate required fields
        if (!caseTitle.trim()) {
            Alert.alert('Error', 'Please enter case title');
            return;
        }
        if (!selectedScanType) {
            Alert.alert('Error', 'Please select scan type');
            return;
        }
        if (!selectedScanParameter) {
            Alert.alert('Error', 'Please select scan parameter');
            return;
        }

        try {
            setLoading(true);

            // Prepare data for API
            const caseData = {
                title: caseTitle.trim(),
                scan_type: selectedScanType?.id,
                scan_parameter: selectedScanParameter?.id,
                qr_length: qrCharacterLength,
                user_id: await AsyncStorage.getItem('npk'),
            };

            console.log('Case data to submit:', caseData);
            const response = await api.post('/cases', caseData);
            
            Alert.alert('Success', 'Case created successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.error('Error creating case:', error);
            Alert.alert('Error', 'Failed to create case. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Create New Case</Text>

                {/* Case Title Input */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Case Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter case title"
                        value={caseTitle}
                        onChangeText={setCaseTitle}
                    />
                </View>

                {/* Scan Type Select */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Scan Type</Text>
                    <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => setScanTypeModalVisible(true)}>
                        <Text style={selectedScanType ? styles.selectButtonTextSelected : styles.selectButtonTextPlaceholder}>
                            {selectedScanType?.label || 'Select scan type'}
                        </Text>
                        <Text style={styles.selectButtonArrow}>▼</Text>
                    </TouchableOpacity>
                </View>

                {/* Scan Parameter Select */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Scan Parameter</Text>
                    <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => setScanParameterModalVisible(true)}>
                        <Text style={selectedScanParameter ? styles.selectButtonTextSelected : styles.selectButtonTextPlaceholder}>
                            {selectedScanParameter?.label || 'Select scan parameter'}
                        </Text>
                        <Text style={styles.selectButtonArrow}>▼</Text>
                    </TouchableOpacity>
                </View>

                {/* Scan QR Textarea */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Scan QR</Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder="Enter or scan QR code"
                        value={scanQrText}
                        onChangeText={setScanQrText}
                        multiline={true}
                        numberOfLines={4}
                        textAlignVertical="top"
                        showSoftInputOnFocus={false} // ✅ disables keyboard
                    />
                </View>

                {/* QR Character Length Input (Auto-filled) */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Panjang Karakter QR</Text>
                    <TextInput
                        style={[styles.input, styles.readOnlyInput]}
                        value={qrCharacterLength}
                        editable={false}
                        placeholder="0"
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity style={[styles.submitButton, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.submitButtonText}>Create Case</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Scan Type Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={scanTypeModalVisible}
                onRequestClose={() => setScanTypeModalVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setScanTypeModalVisible(false)}>
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Select Scan Type</Text>
                            {scanTypeOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={styles.modalOption}
                                    onPress={() => handleScanTypeSelect(option)}>
                                    <Text style={styles.modalOptionText}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Scan Parameter Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={scanParameterModalVisible}
                onRequestClose={() => setScanParameterModalVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setScanParameterModalVisible(false)}>
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Select Scan Parameter</Text>
                            {scanParameterOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={styles.modalOption}
                                    onPress={() => handleScanParameterSelect(option)}>
                                    <Text style={styles.modalOptionText}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </ScrollView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    formContainer: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#212121',
    },
    fieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    textarea: {
        minHeight: 100,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    readOnlyInput: {
        backgroundColor: '#f5f5f5',
        color: '#666',
    },
    selectButton: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
    },
    selectButtonTextSelected: {
        fontSize: 16,
        color: '#212121',
    },
    selectButtonTextPlaceholder: {
        fontSize: 16,
        color: '#999',
    },
    selectButtonArrow: {
        fontSize: 12,
        color: '#666',
    },
    submitButton: {
        backgroundColor: '#007bff',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        maxHeight: '60%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        color: '#212121',
    },
    modalOption: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#212121',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});

export default CreateScreen;