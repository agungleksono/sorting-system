import React, {useState, useEffect, useRef} from 'react';
import {View, TextInput, Button, Text, StyleSheet, Alert} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import api from '../api/axiosInstance';

const ScanScreen = ({navigation}) => {
  const scanInputRef = useRef(null);
  const [partNo, setPartNo] = useState('');
  const [qrCode, setQrCode] = useState('');
  // const [lotNo, setLotNo] = useState('');
  const [selectedValue, setSelectedValue] = useState('Select Part No.');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isJudgmentVisible, setIsJudgmentVisible] = useState(false);
  const [judgmentState, setJudgmentState] = useState({
    message: '',
    color: '',
  });

  const handleSubmit = async () => {
    const response = await api.post('/scan', {
      part_no: partNo,
      qr_code: qrCode,
    });

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
      console.log(response);

      if (response.data.meta.code == '200') {
        setOptions(response.data.data.part_no);
        console.log(response.data.data.part_no);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
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

  // Call getPartNo when the component mounts
  useEffect(() => {
    scanInputRef.current?.focus();
    getPartNo();
  }, []);

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Select Part No.: {selectedValue}</Text> */}

      {/* <Picker
        selectedValue={selectedValue}
        onValueChange={itemValue => setSelectedValue(itemValue)}
        style={styles.picker}>
        <Picker.Item label="Select Part No." value="Select Part No." />
        <Picker.Item label="Java" value="java" />
        <Picker.Item label="JavaScript" value="javascript" />
        <Picker.Item label="Python" value="python" />
      </Picker> */}

      <Picker
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
      </Picker>

      <TextInput
        ref={scanInputRef}
        style={styles.input}
        placeholder="Scan QR Code"
        value={qrCode}
        onChangeText={setQrCode}
        onSubmitEditing={handleSubmit}
        // returnKeyType="done"
      />

      {isJudgmentVisible && (
        <View
          style={[styles.squareAlert, {backgroundColor: judgmentState.color}]}>
          {/* {judgmentState.message === 'NG' && (
            <>
              <Text style={styles.alertSubText}>Part No: JK12345-1234</Text>
              <Text style={styles.alertSubText}>Lot No: whri234we</Text>
            </>
          )} */}
          <Text style={styles.alertText}>{judgmentState.message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    width: '100%',
    marginBottom: 12,
    paddingLeft: 8,
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
});

export default ScanScreen;
