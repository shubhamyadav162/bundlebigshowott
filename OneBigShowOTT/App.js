import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar, LogBox, StyleSheet, Animated, View, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider as ElementsThemeProvider } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { preventAutoHideAsync } from 'expo-splash-screen';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import * as WebBrowser from 'expo-web-browser';
import { Asset } from 'expo-asset';
import Constants from 'expo-constants';
import * as Font from 'expo-font';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Firebase initialization
import { auth } from './src/utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import AuthContext from './src/context/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { theme } from './src/theme';
import AdminNavigator from './src/navigation/AdminNavigator';

// Suppress warnings
LogBox.ignoreLogs([
  'Reanimated 2',
  'new NativeEventEmitter() was called with a non-null argument without the required removeListeners method',
  'new NativeEventEmitter() was called with a non-null argument without the required addListener method',
]);

// Prevent splash auto-hide
try {
  preventAutoHideAsync();
} catch (e) {
  console.warn('Error preventing splash screen from hiding:', e);
}

// Complete any pending OAuth sessions
WebBrowser.maybeCompleteAuthSession();

// Get proper config based on Expo SDK version
const getExpoConfig = () => {
  // For Expo SDK 46 and above
  if (Constants.expoConfig) {
    return Constants.expoConfig;
  }
  
  // For Expo SDK 45 and below
  return Constants.manifest;
};

const App = () => {
  const isWeb = Platform.OS === 'web';
  const [isAppReady, setIsAppReady] = useState(isWeb);
  const [userToken, setUserToken] = useState(null);
  const [showSplash, setShowSplash] = useState(!isWeb);
  const [loadError, setLoadError] = useState(null);
  const splashOpacity = useRef(new Animated.Value(1)).current;

  // Log current Expo config for debugging
  useEffect(() => {
    const expoConfig = getExpoConfig();
    console.log('Expo Config Extra Keys:', Object.keys(expoConfig?.extra || {}));
  }, []);

  // Preload assets with retry mechanism
  useEffect(() => {
    if (isWeb) return;
    const loadAssets = async () => {
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          console.log('Attempting to load assets, try #', retryCount + 1);
          
          // Use a Promise.all to load multiple assets if needed
          await Promise.all([
            Asset.loadAsync(require('./assets/logo_main.png')),
            // Load icon fonts
            Font.loadAsync({
              'Ionicons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
              'MaterialCommunityIcons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
            }),
            // Add other assets here if needed
          ]);
          
          console.log('Assets loaded successfully');
          setIsAppReady(true);
          return; // Exit on success
        } catch (error) {
          console.error('Error loading assets (attempt ' + (retryCount + 1) + '):', error);
          retryCount++;
          
          if (retryCount >= maxRetries) {
            console.error('Maximum asset loading retries reached');
            setLoadError('Failed to load application assets. Please check your connection and try again.');
            setIsAppReady(true); // Still set app as ready so we can show the error
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    };
    
    loadAssets();
    
    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!isAppReady) {
        console.log('Asset loading safety timeout triggered');
        setIsAppReady(true);
      }
    }, 10000); // Extended to 10 seconds for slower connections
    
    return () => clearTimeout(timeout);
  }, [isWeb]);

  // Monitor Firebase auth state changes
  useEffect(() => {
    if (isWeb) {
      // Skip Firebase auth on web for now
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Firebase auth state changed:', user ? `User: ${user.email}` : 'No user');
      if (user) {
        const token = user.uid;
        await AsyncStorage.setItem('userToken', token);
        setUserToken(token);
      } else {
        // Check for stored token as fallback
        try {
          const token = await AsyncStorage.getItem('userToken');
          setUserToken(token);
        } catch (error) {
          console.error('Error loading user token:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [isWeb]);

  // Splash fade-out handler
  const handlePlaybackStatus = (status) => {
    if (status.didJustFinish) {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setShowSplash(false));
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('userToken');
      setUserToken(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!isAppReady) return null;
  
  // Show error message if assets failed to load
  if (loadError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{loadError}</Text>
        <Text style={styles.errorSubText}>Please restart the application.</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        signIn: async (token) => { await AsyncStorage.setItem('userToken', token); setUserToken(token); },
        signOut: handleSignOut,
        signUp: async (token) => { await AsyncStorage.setItem('userToken', token); setUserToken(token); },
      }}
    >
      <ErrorBoundary>
        <SafeAreaProvider>
          <ElementsThemeProvider theme={theme}>
            <StatusBar translucent={false} barStyle="light-content" backgroundColor={theme.colors.primary} />
            <NavigationContainer>
              {showSplash && (
                <View style={StyleSheet.absoluteFill}>
                  {/* AppSplash component is removed */}
                </View>
              )}
              {userToken ? (
                <MainNavigator />
              ) : (
                <AuthNavigator />
              )}
            </NavigationContainer>
          </ElementsThemeProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  splashOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#000' },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  errorSubText: { color: '#BBBBBB', fontSize: 14, textAlign: 'center' },
});

export default App; 