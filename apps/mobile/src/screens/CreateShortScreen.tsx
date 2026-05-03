import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateShortScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  
  const cameraRef = useRef<any>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{color:'white'}}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btn}><Text>Grant</Text></TouchableOpacity>
      </View>
    );
  }

  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handleRecord = async () => {
    if (isRecording) {
      cameraRef.current?.stopRecording();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      const data = await cameraRef.current?.recordAsync({ maxDuration: 180 });
      setVideoUri(data.uri);
    }
  };

  // Mock Edit Mode
  if (videoUri) {
    return (
      <SafeAreaView style={styles.container}>
         <View style={styles.header}><Text style={styles.title}>Edit Short</Text></View>
         <View style={styles.videoPreview}><Text style={{color:'white'}}>Video Preview: {videoUri}</Text></View>
         
         <View style={styles.tools}>
            <TouchableOpacity style={styles.toolBtn}><Text style={styles.toolText}>Trim</Text></TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}><Text style={styles.toolText}>Speed (1x)</Text></TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}><Text style={styles.toolText}>Aa Text</Text></TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}><Text style={styles.toolText}>🎵 Sound</Text></TouchableOpacity>
         </View>

         <TouchableOpacity style={styles.publishBtn}><Text style={{fontWeight:'bold'}}>Next: Publish</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.cameraOverlay}>
          <TouchableOpacity 
            style={styles.flipBtn} 
            onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
          >
            <Text style={{fontSize: 24}}>🔄</Text>
          </TouchableOpacity>

          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.galleryBtn} onPress={pickVideo}>
               <View style={styles.galleryInner} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.recordOuter} onPress={handleRecord}>
               <View style={isRecording ? styles.recordInnerActive : styles.recordInner} />
            </TouchableOpacity>

            <View style={{width: 50}} /> {/* Spacer */}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1, width: '100%' },
  cameraOverlay: { flex: 1, justifyContent: 'space-between', padding: 20 },
  flipBtn: { alignSelf: 'flex-end', marginTop: 40, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 30 },
  bottomControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  recordOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: 'white', justifyContent: 'center', alignItems: 'center' },
  recordInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'red' },
  recordInnerActive: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'red' },
  galleryBtn: { width: 50, height: 50, borderRadius: 10, borderWidth: 2, borderColor: 'white', overflow: 'hidden' },
  galleryInner: { flex: 1, backgroundColor: 'gray' },
  btn: { backgroundColor: 'white', padding: 10, marginTop: 10, borderRadius: 5 },
  header: { flexDirection: 'row', width: '100%', padding: 20 },
  title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  videoPreview: { flex: 1, width: '100%', backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
  tools: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', padding: 20 },
  toolBtn: { backgroundColor: '#333', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20 },
  toolText: { color: 'white', fontWeight: '500' },
  publishBtn: { backgroundColor: 'white', width: '90%', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 }
});
