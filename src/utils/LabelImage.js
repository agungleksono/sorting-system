import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';

const LabelImage = ({ onCapture }) => {
// const LabelImage = ({ onCapture, previewOnly = false }) => {
  const viewRef = useRef();

  useEffect(() => {
    // if (!previewOnly) {
        // Automatically capture after rendering if not in preview
        setTimeout(() => {
            viewRef.current.capture().then(uri => {
            onCapture(uri);
            });
        }, 500);
    // }
  }, []);

  return (
    <ViewShot
      ref={viewRef}
      options={{ format: 'png', quality: 1, result: 'base64' }}
      style={styles.container}
    >
      <View style={styles.label}>
        <Text style={styles.title}> Product Name</Text>
        <Text style={styles.price}>Price: $9.99</Text>
        <Text style={styles.description}>Bold, custom-sized text!</Text>
      </View>
    </ViewShot>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 384,  // in pixels
    height: 200,
    backgroundColor: 'white',
  },
  label: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold', // This is what you wanted
  },
  price: {
    fontSize: 20,
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 5,
  },
});

export default LabelImage;