import React from 'react';
import {Button, View, Text, StyleSheet} from 'react-native';

const MenuScreen = ({navigation}) => {
  return (
    <View style={styles.centeredContainer}>
      <Button title="Scan" onPress={() => navigation.navigate('Scan')} />
    </View>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
});

export default MenuScreen;
