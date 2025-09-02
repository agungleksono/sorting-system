// import React, { useState } from 'react';
// import { View, Button, ScrollView, Text, Alert, Platform, PermissionsAndroid } from 'react-native';
// import LabelImage from '../utils/LabelImage';
// import {
//     BluetoothManager,
//     BluetoothEscposPrinter,
// } from 'react-native-bluetooth-escpos-printer';

// const requestBluetoothPermissions = async () => {
//     if (Platform.OS === 'android') {
//         const granted = await PermissionsAndroid.requestMultiple([
//             PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
//             PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
//             PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         ]);
//         console.log('Permissions granted:', granted);
//         return granted;
//     }
// };

// const PrintScreen = () => {
//     const [base64Image, setBase64Image] = useState(null);
  
//     const handleCapture = async (base64) => {
//       setBase64Image(base64); // Save image for print
//       console.log('Label captured as base64.');
//     };
  
//     const handlePrint = async () => {
//         const base64Image =
//   'iVBORw0KGgoAAAANSUhEUgAAAlgAAAFgCAYAAAB5nZnfAAAHFElEQVR4nO3dQU7DMBBE0bv//9eVnHTIZRUomLzjzfb8PkE9ygYRiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIYhiGIZhGIZx1Rf0HklbNBlA+eUcAAAAASUVORK5CYII=';


//         if (!base64Image) {
//             console.warn('No label captured yet.');
//             return;
//         }
//         const PRINTER_ADDRESS = '10:23:81:2E:81:19';
  
//         try {
//             await requestBluetoothPermissions();
//             await BluetoothEscposPrinter.printerInit();
//     await BluetoothEscposPrinter.printerAlign(
//       BluetoothEscposPrinter.ALIGN.CENTER,
//     );
//             // Connect to printer
//             await BluetoothManager.connect(PRINTER_ADDRESS);
//             console.log('Connected to printer');
    
//             // Print the label
//             await BluetoothEscposPrinter.printPic(base64Image, {
//             width: 616, // Match label width in pixels
//             left: 0,
//             });
    
//             console.log('Printed successfully!');
//             Alert.alert('Success', 'Label printed!');
//         } catch (err) {
//             console.error('Print error:', err);
//             Alert.alert('Error', 'Failed to print: ' + err.message);
//         }
//     };
  
//     return (
//     //   <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 20 }}>
//     //     <LabelImage onCapture={handleCapture} previewOnly={true} />
  
//     //     <View style={{ marginTop: 30 }}>
//     //       <Button title="Print Label" onPress={handlePrint} />
//     //     </View>
//     //   </ScrollView>
//         <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 20 }}>
//             <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>Label Preview (Scaled):</Text>

//             {/* SCALE DOWN for preview only */}
//             <View style={{ transform: [{ scale: 0.5 }], borderWidth: 1, borderColor: '#ccc' }}>
//                 <LabelImage onCapture={handleCapture} previewOnly={true} />
//             </View>

//             <View style={{ marginTop: 30 }}>
//                 <Button title="Print Label" onPress={handlePrint} />
//             </View>
//         </ScrollView>
//     );
// };
  
// export default PrintScreen;



import React, { useEffect, useState } from 'react';
import { View, Alert, PermissionsAndroid, Platform, Button } from 'react-native';
import {
    BluetoothManager,
    BluetoothEscposPrinter,
  } from 'react-native-bluetooth-escpos-printer';
import LabelImage from '../utils/LabelImage'; // ✅ Make sure the path is correct

const PRINTER_ADDRESS = '10:23:81:2E:81:19';

const PrinterScreen = () => {
    const [imageBase64, setImageBase64] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        requestPermissions();
      }, []);

    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);
        }
    };

    const handleCapture = (base64) => {
        console.log("Captured image base64 length:", base64?.length);
        setImageBase64(base64);
      };

    const connectToPrinter = async () => {
        try {
            const isEnabled = await BluetoothManager.isBluetoothEnabled();
            if (!isEnabled) {
            await BluetoothManager.enableBluetooth();
            }

            await BluetoothManager.connect(PRINTER_ADDRESS);
            setConnected(true);
            Alert.alert('Connected', 'Printer connected successfully.');
        } catch (error) {
            console.error('Connection error:', error);
            Alert.alert('Connection Error', error.message || 'Failed to connect');
        }
    };

    const handlePrint = async () => {
        if (!connected || !imageBase64) {
            Alert.alert("Not ready", "Please connect to printer and capture image first.");
            return;
        }
    
        try {
            // Step 1: Test text first
            await BluetoothEscposPrinter.printText("=== Hello Printer ===\r\n", {
                encoding: 'GBK',
                codepage: 0,
                widthtimes: 0,
                heigthtimes: 0,
                fonttype: 1
            });
            
            const cleanedBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        
            await BluetoothEscposPrinter.printPic(cleanedBase64, {
                width: 384, // Adjust for your printer
                left: 0,
            });
        
            console.log('Printed successfully!');
        } catch (error) {
            console.error('Print error:', error);
            Alert.alert('Print Failed', error.message || 'Unable to print');
        }
    };

  return (
    // <View style={{ flex: 1 }}>
    //   <LabelImage onCapture={handlePrint} />
    // </View>
    <View style={{ flex: 1 }}>
        <LabelImage onCapture={handleCapture} />

        <Button title="Connect to Printer" onPress={connectToPrinter} />
        <Button title="Print Label" onPress={handlePrint} disabled={!connected} />
    </View>
  );
};

export default PrinterScreen;