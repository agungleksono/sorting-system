import React, {useState} from 'react';
import {View, TextInput, Button, Text, StyleSheet, Alert} from 'react-native';

const ScanScreen = ({navigation}) => {
  const [partNo, setPartNo] = useState('');

  const handleSubmit = () => {
    Alert.alert('Key Pressed!', 'Enter');
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Scan"
        value={partNo}
        onChangeText={setPartNo}
        onSubmitEditing={handleSubmit}
        // returnKeyType="done"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    borderRadius: 4,
  },
});

export default ScanScreen;
