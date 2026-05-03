import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, useColorScheme, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ChevronDown, Film, FileVideo, X, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';

const CATEGORIES = ['Tech','Gaming','Music','Education','Entertainment','Sports','Cooking','Travel','News','Other'];
const VISIBILITY_OPTIONS = [{ label: 'Public', desc: 'Anyone can watch' }, { label: 'Unlisted', desc: 'Anyone with the link' }, { label: 'Private', desc: 'Only you' }];
type UploadType = 'video' | 'short' | null;

export default function UploadScreen() {
  const scheme = useColorScheme();
  const C = scheme === 'dark' ? Colors.dark : Colors.light;

  const [uploadType, setUploadType] = useState<UploadType>(null);
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tech');
  const [visibility, setVisibility] = useState('Public');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setFile({ name: asset.fileName ?? 'video.mp4', size: asset.fileSize ?? 0 });
    }
  };

  const simulateUpload = async () => {
    if (!title.trim()) { Alert.alert('Title required'); return; }
    setUploading(true);
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 120));
      setProgress(i);
    }
    setUploading(false);
    setDone(true);
  };

  if (done) return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.bg }]} edges={['top']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.xl }}>
        <View style={[styles.successCircle, { backgroundColor: Colors.brand + '20' }]}>
          <Check size={48} color={Colors.brand} />
        </View>
        <Text style={[styles.heading, { color: C.text, textAlign: 'center' }]}>Upload Complete!</Text>
        <Text style={{ color: C.textMuted, textAlign: 'center', fontSize: FontSize.sm }}>Your video is being processed and will be available soon.</Text>
        <TouchableOpacity onPress={() => { setDone(false); setFile(null); setTitle(''); setUploadType(null); router.replace('/'); }}
          style={[styles.primaryBtn, { backgroundColor: Colors.brand }]}>
          <Text style={styles.primaryBtnText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.bg }]} edges={['top']}>
      <View style={[styles.appBar, { borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()}><X size={22} color={C.text} /></TouchableOpacity>
        <Text style={[styles.heading, { color: C.text }]}>Upload</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.xl }}>
        {/* Upload type selector */}
        {!uploadType && (
          <View style={{ gap: Spacing.md }}>
            <Text style={[styles.label, { color: C.textMuted }]}>Choose upload type</Text>
            {[
              { type: 'video' as UploadType, icon: Film, title: 'Video', desc: 'Long-form content, up to 128 GB' },
              { type: 'short' as UploadType, icon: FileVideo, title: 'Short', desc: 'Vertical video, up to 3 minutes' },
            ].map(opt => (
              <TouchableOpacity key={opt.type!} onPress={() => setUploadType(opt.type)}
                style={[styles.typeCard, { backgroundColor: C.surface, borderColor: C.border }]}>
                <opt.icon size={28} color={Colors.brand} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.typeTitle, { color: C.text }]}>{opt.title}</Text>
                  <Text style={[styles.typeMeta, { color: C.textMuted }]}>{opt.desc}</Text>
                </View>
                <ChevronDown size={18} color={C.textMuted} style={{ transform: [{ rotate: '-90deg' }] }} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {uploadType && (
          <>
            <Text style={[styles.badge, { backgroundColor: Colors.brand + '20', color: Colors.brand }]}>{uploadType === 'short' ? '⚡ Short' : '🎬 Video'}</Text>

            {/* File picker */}
            <TouchableOpacity onPress={pickVideo} style={[styles.dropzone, { borderColor: C.border, backgroundColor: C.surface }]}>
              <Film size={32} color={C.textMuted} />
              {file ? (
                <><Text style={[styles.fileName, { color: C.text }]}>{file.name}</Text><Text style={{ color: C.textMuted, fontSize: FontSize.xs }}>{(file.size / 1_000_000).toFixed(1)} MB</Text></>
              ) : (
                <><Text style={[styles.dropText, { color: C.text }]}>Tap to select video</Text><Text style={{ color: C.textMuted, fontSize: FontSize.xs }}>MP4, MOV, WebM</Text></>
              )}
            </TouchableOpacity>

            {/* Title */}
            <View style={{ gap: Spacing.sm }}>
              <Text style={[styles.label, { color: C.textMuted }]}>Title *</Text>
              <View style={[styles.inputBox, { backgroundColor: C.surface, borderColor: C.border }]}>
                <Text style={{ color: title ? C.text : C.textMuted, fontSize: FontSize.sm, flex: 1 }} onPress={() => {}} numberOfLines={1}>{title || 'Add a title...'}</Text>
              </View>
            </View>

            {/* Category */}
            <View style={{ gap: Spacing.sm }}>
              <Text style={[styles.label, { color: C.textMuted }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat} onPress={() => setCategory(cat)}
                    style={[styles.chip, { backgroundColor: category===cat ? Colors.brand : C.surface, borderColor: category===cat ? Colors.brand : C.border }]}>
                    <Text style={[styles.chipText, { color: category===cat ? '#fff' : C.text }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Visibility */}
            <View style={{ gap: Spacing.sm }}>
              <Text style={[styles.label, { color: C.textMuted }]}>Visibility</Text>
              {VISIBILITY_OPTIONS.map(opt => (
                <TouchableOpacity key={opt.label} onPress={() => setVisibility(opt.label)}
                  style={[styles.visRow, { borderColor: visibility===opt.label ? Colors.brand : C.border, backgroundColor: visibility===opt.label ? Colors.brand+'12' : C.surface }]}>
                  <View style={[styles.radio, { borderColor: visibility===opt.label ? Colors.brand : C.border }]}>
                    {visibility===opt.label && <View style={[styles.radioDot, { backgroundColor: Colors.brand }]} />}
                  </View>
                  <View>
                    <Text style={[styles.visLabel, { color: C.text }]}>{opt.label}</Text>
                    <Text style={[styles.visDesc, { color: C.textMuted }]}>{opt.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Progress or Submit */}
            {uploading ? (
              <View style={{ gap: Spacing.sm }}>
                <View style={[styles.progressBg, { backgroundColor: C.surface }]}>
                  <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: Colors.brand }]} />
                </View>
                <Text style={[styles.progressText, { color: C.textMuted }]}>Uploading… {progress}%</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={simulateUpload} style={[styles.primaryBtn, { backgroundColor: Colors.brand }]}>
                <Text style={styles.primaryBtnText}>Upload {uploadType === 'short' ? 'Short' : 'Video'}</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  appBar:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  heading:      { fontSize: FontSize.lg, fontWeight: '700' },
  label:        { fontSize: FontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  typeCard:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderRadius: Radius.xl, borderWidth: 1 },
  typeTitle:    { fontSize: FontSize.md, fontWeight: '700' },
  typeMeta:     { fontSize: FontSize.xs, marginTop: 2 },
  badge:        { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full, fontSize: FontSize.sm, fontWeight: '700' },
  dropzone:     { borderWidth: 2, borderStyle: 'dashed', borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'], gap: Spacing.sm },
  fileName:     { fontSize: FontSize.sm, fontWeight: '600' },
  dropText:     { fontSize: FontSize.sm, fontWeight: '600' },
  inputBox:     { borderWidth: 1, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: 12 },
  chip:         { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1 },
  chipText:     { fontSize: FontSize.sm, fontWeight: '500' },
  visRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1.5 },
  radio:        { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot:     { width: 10, height: 10, borderRadius: 5 },
  visLabel:     { fontSize: FontSize.sm, fontWeight: '600' },
  visDesc:      { fontSize: FontSize.xs, marginTop: 1 },
  progressBg:   { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: FontSize.sm, textAlign: 'center' },
  primaryBtn:   { borderRadius: Radius.xl, paddingVertical: 15, alignItems: 'center' },
  primaryBtnText:{ color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
  successCircle:{ width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
});
