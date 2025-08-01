import {Platform, PermissionsAndroid, Alert} from 'react-native';
import {
    BluetoothManager,
    BluetoothTscPrinter,
} from 'react-native-bluetooth-escpos-printer';

const PRINTER_ADDRESS = '10:23:81:2E:81:19';

export const requestBluetoothPermissions = async () => {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        console.log('Permissions granted:', granted);
        return granted;
    }
};

/**
 * Print a label.
 * @param {{ mainText: string, partNumber: string }} data
 */
// export const printLabel = async ({mainText, partNo}) => {
//     try {
//         await requestBluetoothPermissions();
//         await BluetoothManager.connect(PRINTER_ADDRESS);
//         await BluetoothTscPrinter.printLabel({
//             width: 0,
//             height: 100,
//             gap: 2,
//             direction: BluetoothTscPrinter.DIRECTION.FORWARD,
//             reference: [0, 0],
//             tear: 'OFF',
//             sound: 0,
//             text: [
//                 {
//                     x: 240,
//                     y: 700,
//                     text: mainText,
//                     fonttype: '7',
//                     rotation: 270,
//                     xscal: 10,
//                     yscal: 10,
//                 },
//                 {
//                     x: 500,
//                     y: 780,
//                     text: `Part No:${partNo}`,
//                     fonttype: '2',
//                     rotation: 270,
//                     xscal: 2,
//                     yscal: 2,
//                 },
//             ],
//         });
//         // Alert.alert('Success', 'Label sent to printer!');
//     } catch (error) {
//         console.error('Print error:', error);
//         Alert.alert('Error', error.message || 'Failed to print.');
//     }
// };

// const FONT_BASE_HEIGHT = {
//     1: 16,
//     2: -290,
//     3: 32,
//     4: 48,
//     5: 64,
//     6: 72,
//     7: 182,
// };

// const calculateCenteredY = (labelHeightMm, fonttype, yscal) => {
//     const dotsPerMm = 8; // For 203dpi printer
//     const labelHeightDots = labelHeightMm * dotsPerMm; //720

//     const baseHeight = FONT_BASE_HEIGHT[fonttype] || 24; // 100
//     const textHeight = baseHeight * yscal; // 1000

//     const y = (labelHeightDots - textHeight) / 2;
//     console.log(
//         `labelHeightDots: ${labelHeightDots} - baseHeight: ${baseHeight} - textHeight: ${textHeight} - y: ${y}`,
//     );
//     return Math.round(y);
// };

const FONT_BASE_SIZE = {
    1: {width: 8, height: 16},
    2: {width: -24, height: 24},
    3: {width: 16, height: 32},
    4: {width: 24, height: 48},
    5: {width: 32, height: 64},
    6: {width: 36, height: 72},
    7: {width: 90, height: 100},
};

// const FONT_BASE_HEIGHT = {
//     1: 16,
//     2: -290,
//     3: 32,
//     4: 48,
//     5: 64,
//     6: 72,
//     7: 182,
// };

// const FONT_BASE = {
//     2: {width: 3, height: 4},
// };

// const calculateYPartNo = (labelHeightMm, text) => {
//     const font = FONT_BASE_SIZE[fonttype] || {width: 12, height: 24};

//     const y = (labelHeightMm - 3 * text.length) / 2;
//     const result = Math.round(y);
//     console.log(result + 300);
//     return result + 300;
// };

const calculateCenteredY = (labelHeightMm, text, fonttype, yscal, rotation) => {
    const dotsPerMm = 8; // 203 DPI printer
    const labelHeightDots = labelHeightMm * dotsPerMm;

    const font = FONT_BASE_SIZE[fonttype] || {width: 12, height: 24};
    console.log(font);

    // If rotated 270, height becomes width * length * scale
    const charHeight =
        rotation === 270 ? font.width * yscal : font.height * yscal;
    const totalHeight = charHeight * text.length;

    const y = (labelHeightDots - totalHeight) / 2;
    console.log(
        `labelHeightDots: ${labelHeightDots} - charHeight: ${charHeight} - textLength:${text.length} - totalHeight: ${totalHeight} - y: ${y}`,
    );
    return Math.round(y);
};

export const printLabel = async ({mainText, partNo}) => {
    // const labelHeightMm = 90;
    // const dotsPerMm = 8;
    // const labelHeightDots = labelHeightMm * dotsPerMm; // = 720 dots

    // const text = mainText;
    // const textHeight = 24; // Approximate height for fonttype '2'
    // const centerY = Math.floor((labelHeightDots - textHeight) / 2);

    const labelHeightMm = 90;
    const ngFonttype = 7;
    const ngYscal = 10;
    const ngY = calculateCenteredY(
        labelHeightMm,
        mainText,
        ngFonttype,
        ngYscal,
        270,
    );
    // return;

    // partNo = 'JK231223-0987';
    const secondText = mainText == 'NG' ? `Part No:${partNo}` : '';
    const partFonttype = 2;
    const partYscal = 2;
    const partY = calculateCenteredY(
        labelHeightMm,
        partNo,
        partFonttype,
        partYscal,
        270,
    );

    // const partY2 = calculateYPartNo(labelHeightMm, partNo);

    try {
        await requestBluetoothPermissions();
        await BluetoothManager.connect(PRINTER_ADDRESS);
        await BluetoothTscPrinter.printLabel({
            width: 0,
            height: labelHeightMm,
            gap: 2,
            direction: BluetoothTscPrinter.DIRECTION.FORWARD,
            reference: [0, 0],
            tear: 'OFF',
            sound: 0,
            text: [
                {
                    x: 240,
                    y: ngY,
                    text: mainText,
                    fonttype: '7',
                    rotation: 270,
                    xscal: 10,
                    yscal: 10,
                },
                {
                    x: 500,
                    y: partY,
                    text: secondText,
                    fonttype: '2',
                    rotation: 270,
                    xscal: 2,
                    yscal: 2,
                },
            ],
        });
        // Alert.alert('Success', 'Label sent to printer!');
    } catch (error) {
        console.error('Print error:', error);
        Alert.alert('Error', error.message || 'Failed to print.');
    }
};
