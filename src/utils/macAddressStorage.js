import AsyncStorage from '@react-native-async-storage/async-storage';

const MAC_KEY = '@printer_mac_address';

export const getPrinterMac = async () => {
    try {
        const mac = await AsyncStorage.getItem(MAC_KEY);
        return mac;
    } catch (error) {
        console.error('Failed to get MAC address:', error);
        return null;
    }
};

export const savePrinterMac = async (macAddress) => {
    try {
      await AsyncStorage.setItem(MAC_KEY, macAddress);
    } catch (error) {
      console.error('Failed to save MAC address:', error);
    }
};
  
export const clearPrinterMac = async () => {
    try {
        await AsyncStorage.removeItem(MAC_KEY);
    } catch (error) {
        console.error('Failed to clear MAC address:', error);
    }
};