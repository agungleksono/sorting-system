import {Platform, PermissionsAndroid} from 'react-native';
import {
    BluetoothManager,
    BluetoothTscPrinter,
} from 'react-native-bluetooth-escpos-printer';
import { getPrinterMac } from './macAddressStorage';

// const PRINTER_ADDRESS = '10:23:81:2E:81:19'; // Your paired printer MAC address

/*
*   Example usage:
*   getFormattedDate(); // Default: "250910" (yymmdd)
*   getFormattedDate(new Date(), 'dd-mm-yy'); // "10-09-25"
*   getFormattedDate(new Date(), 'yy/mm/dd'); // "25/09/10"
*/
function getFormattedDate(date = new Date(), format = 'yymmdd') {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const yearFull = date.getFullYear();
    const yearShort = String(yearFull).slice(-2);
  
    // Replace format tokens with actual values
    return format
      .replace(/dd/i, day)
      .replace(/mm/i, month)
      .replace(/yyyy/i, yearFull)
      .replace(/yy/i, yearShort);
}

function qrContent(judgment, partNo, sequence) {
    const mainContent = `SS: ${getFormattedDate()} ${sequence.padStart(5, '0')} ${judgment} ${partNo} `;
    return mainContent.padEnd(44, '0'); // fill the remain character with '0' until the lenth of the string is 44 digit
}

export const printCustomLabel = async ({judgment = 'NG', partNo = '<Part No>', sequence = '<Sequence>'}) => {
    try {
        const PRINTER_ADDRESS = await getPrinterMac();
        if (!PRINTER_ADDRESS) {
            throw new Error('No printer MAC address saved. Please pair a printer first.');
        }

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
                    x: 330,
                    y: 280,
                    text: `Sequence : ${sequence.padStart(5, '0')}`,
                    fonttype: 'FONT_2',
                    rotation: 0,
                    xscal: 1,
                    yscal: 1,
                },
                {
                    x: 50,
                    y: 280,
                    text: `Tanggal : ${getFormattedDate(new Date(), 'dd-mm-yy')}`,
                    fonttype: 'FONT_2',
                    rotation: 0,
                    xscal: 1,
                    yscal: 1,
                },
            ],
            qrcode: [
                {
                    x: 50,
                    y: 100,
                    level: 'M',
                    width: 5,
                    code: qrContent(judgment, partNo, sequence),
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