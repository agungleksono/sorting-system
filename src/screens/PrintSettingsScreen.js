import React, {useState, useEffect, useCallback} from 'react';
import {
    ActivityIndicator,
    DeviceEventEmitter,
    NativeEventEmitter,
    PermissionsAndroid,
    Platform,
    ScrollView,
    Text,
    ToastAndroid,
    View,
    Button,
    Alert,
} from 'react-native';
import {
    BluetoothManager,
    BluetoothEscposPrinter,
    BluetoothTscPrinter,
} from 'react-native-bluetooth-escpos-printer';

const PrintSettingsScreen = ({navigation}) => {
    // const [isEnabled, setIsEnabled] = useState(false);
    // const [devices, setDevices] = useState([]);
    // const [selectedDevice, setSelectedDevice] = useState(null);
    const PRINTER_ADDRESS = '10:23:81:2E:81:19';

    // Ask for Bluetooth permissions on Android
    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);
            console.log('Permissions granted:', granted);
        }
    };

    useEffect(() => {
        requestPermissions();
    }, []);

    // const printLabel = async () => {
    //     try {
    //         console.log('Connecting to printer...');
    //         await BluetoothManager.connect(PRINTER_ADDRESS);
    //         console.log('Connected.');

    //         await BluetoothTscPrinter.printLabel({
    //             width: 60, // Label width in mm
    //             height: 40, // Label height in mm
    //             gap: 2, // Gap between labels in mm
    //             direction: BluetoothTscPrinter.DIRECTION.FORWARD,
    //             reference: [0, 0],
    //             tear: 'true',
    //             sound: 2,
    //             text: [
    //                 {
    //                     x: 10,
    //                     y: 10,
    //                     text: 'Label from React Native',
    //                     fonttype: '2',
    //                     rotation: 0,
    //                     xscal: 1,
    //                     yscal: 1,
    //                 },
    //             ],
    //             qrcode: [
    //                 {
    //                     x: 10,
    //                     y: 80,
    //                     level: 'L',
    //                     width: 3,
    //                     code: 'https://example.com',
    //                 },
    //             ],
    //             // You can add barcodes or other content here
    //         });

    //         Alert.alert('Success', 'Label sent to printer!');
    //     } catch (e) {
    //         console.error('❌ Print error:', e);
    //         Alert.alert('Error', e.message || 'Failed to print label.');
    //     }
    // };

    const printLabel = async () => {
        try {
            await requestPermissions();
            await BluetoothManager.connect(PRINTER_ADDRESS);
            await BluetoothTscPrinter.printLabel({
                width: 0,
                height: 100,
                gap: 2,
                direction: BluetoothTscPrinter.DIRECTION.FORWARD,
                reference: [0, 0],
                tear: 'OFF',
                sound: 0,
                text: [
                    {
                        x: 240,
                        y: 700,
                        // x: 240,
                        // y: 700,
                        // x: 50,
                        // y: 570,
                        text: 'NG',
                        fonttype: '7',
                        rotation: 270,
                        xscal: 10,
                        yscal: 10,
                    },
                    {
                        x: 500,
                        y: 780,
                        // x: 500,
                        // y: 780,
                        // x: 250,
                        // y: 700,
                        text: 'Part No:JK192345-1293',
                        fonttype: '2',
                        rotation: 270,
                        xscal: 2,
                        yscal: 2,
                    },
                ],
            });
            Alert.alert('Success', 'Label sent to printer!');
        } catch (error) {
            console.error('Print error:', error);
            Alert.alert('Error', error.message || 'Failed to print.');
        }
    };

    // // Check Bluetooth and get paired devices
    // const initBluetooth = async () => {
    //     try {
    //         const enabled = await BluetoothManager.isBluetoothEnabled();
    //         setIsEnabled(enabled);
    //         console.log('Bluetooth enabled:', enabled);

    //         if (!enabled) {
    //             Alert.alert(
    //                 'Bluetooth is disabled',
    //                 'Please enable Bluetooth.',
    //             );
    //             return;
    //         }

    //         const scanResult = await BluetoothManager.scanDevices();
    //         console.log('Raw scan result:', scanResult);

    //         const paired = scanResult?.paired;
    //         if (!paired) {
    //             Alert.alert('Scan failed', 'No paired device data found.');
    //             return;
    //         }

    //         const pairedDevices = JSON.parse(scanResult.paired);
    //         console.log('Paired devices:', pairedDevices);

    //         if (pairedDevices.length > 0) {
    //             setDevices(pairedDevices);
    //             setSelectedDevice(pairedDevices[0].address); // auto-select first device
    //         } else {
    //             Alert.alert(
    //                 'No devices',
    //                 'No paired Bluetooth printers found.',
    //             );
    //         }
    //     } catch (e) {
    //         console.error('Bluetooth init error:', e);
    //     }
    // };

    // // Connect and print
    // const testPrint = async () => {
    //     // if (!selectedDevice) {
    //     //     Alert.alert('Error', 'No Bluetooth printer selected.');
    //     //     return;
    //     // }

    //     try {
    //         const connectResult = await BluetoothManager.connect(
    //             '10:23:81:2E:81:19',
    //         );
    //         console.log('Connected to printer:', connectResult);
    //         const printResult = await BluetoothEscposPrinter.printText(
    //             'Hello from React Native!\r\n',
    //             {
    //                 encoding: 'GBK',
    //                 codepage: 0,
    //                 widthtimes: 2,
    //                 heigthtimes: 2,
    //                 fonttype: 1,
    //             },
    //         );
    //         console.log('Print result:', printResult);
    //         Alert.alert('Success', 'Printed successfully!');
    //     } catch (e) {
    //         console.error('Print error:', e);
    //         Alert.alert('Error', e.message || 'Failed to print.');
    //     }
    // };

    // useEffect(() => {
    //     requestPermissions().then(initBluetooth);
    // }, []);

    // useEffect(() => {
    //     // console.log('tes');
    //     BluetoothManager.isBluetoothEnabled().then(
    //         enabled => {
    //             Alert.alert(
    //                 'Bluetooth Status',
    //                 enabled ? 'Enabled' : 'Disabled',
    //             );
    //         },
    //         err => {
    //             Alert.alert(
    //                 'Error',
    //                 err.message || 'Failed to check Bluetooth status',
    //             );
    //         },
    //     );
    // }, []);

    return (
        <View style={{padding: 20}}>
            <Text style={{marginBottom: 10}}>Bluetooth Print Demo</Text>
            {/* <Button title="Test Print" onPress={testPrint} /> */}
            <Button title="Print Label" onPress={printLabel} />
        </View>
    );
};

export default PrintSettingsScreen;
