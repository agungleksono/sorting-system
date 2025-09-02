import {Platform, PermissionsAndroid, Alert} from 'react-native';
import {
    BluetoothManager,
    BluetoothTscPrinter,
} from 'react-native-bluetooth-escpos-printer';

const PRINTER_ADDRESS = '10:23:81:2E:81:19'; // Your paired printer MAC address

export const printCustomLabel = async ({judgment = 'NG', partNo = '<Part No>', sequence = '<Sequence>'}) => {
    try {
        // Connect to printer by MAC address
        await BluetoothManager.connect(PRINTER_ADDRESS);
        console.log('Connected to printer:', PRINTER_ADDRESS);

        // Print label for 77mm x 50mm
        await BluetoothTscPrinter.printLabel({
            width: 77,
            height: 50,
            gap: 2,
            direction: 0,
            reference: [0, 0],
            tear: 'ON',
            sound: 0,
            text: [
                {
                    x: 230,
                    y: 50,
                    text: judgment,
                    fonttype: 'FONT_1',
                    rotation: 0,
                    xscal: 7,
                    yscal: 7,
                },
                {
                    x: 230,
                    y: 210,
                    text: partNo,
                    fonttype: 'FONT_2',
                    rotation: 0,
                    xscal: 2,
                    yscal: 2,
                },
                {
                    x: 230,
                    y: 250,
                    text: sequence,
                    fonttype: 'FONT_2',
                    rotation: 0,
                    xscal: 2,
                    yscal: 2,
                },
            ],
            qrcode: [
                {
                    x: 50,
                    y: 127,
                    level: 'M',
                    width: 5,
                    code: 'https://example.com/product/123',
                    rotation: 0,
                },
            ],
            // barcode: [
            //     {
            //         x: 20,
            //         y: 120,
            //         type: '128',
            //         height: 50,
            //         readable: 1,
            //         rotation: 0,
            //         code: '1234567890',
            //     },
            // ],
            copies: 1,
        });

        console.log('Label printed!');
    } catch (error) {
        console.error('Printing error:', error);
        throw error;
    }
};