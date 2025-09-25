import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const SplashScreen = () => (
  <View style={styles.container}>
    <Image source={require('../assets/image/logo.png')} style={styles.logo}/>
    <Text style={styles.title}>CapstoneArchive</Text>
    <Text style={styles.subtitle}>Discover innovative projects by{"\n"}Consolatrician Students</Text>
    <View style={styles.waveContainer}>
      {/* Decorative waves (can be improved with SVG or images) */}
      <Image source={require('../assets/image/bg_btm.png')} style={styles.bgbtm}/>

    </View>
  </View>
);

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#35359e',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 100,
  },
  logo: {
    width: 343,
    height: 194,
    position: 'center',
    alignItems: 'center',
    top: 90,
  
  },
  title: {
    
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: '#222',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    top: 100,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    top: 100
  },
  bgbtm: {
    top: 150,
   width: 440,
   height: 377,
  },
  
}); 