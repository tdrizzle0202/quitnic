import React from 'react';
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restorePurchases } from '@/lib/revenueCat';
import { useProStatusStore } from '@/lib/proStatusStore';
import {
  ChevronRight,
  Share2,
  Download,
  RotateCcw,
  Star,
  Shield,
  FileText,
  User,
  Camera,
  RefreshCw,
  CreditCard,
  Trash2,
} from 'lucide-react-native';
import { PressableScale, type HapticType } from '@/components/ui/PressableScale';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { COLORS, TYPE, SPACING, RADIUS } from '@/constants/theme';
import { useUserStore, getJoinDateString } from '@/store/useUserStore';

// ── Settings Row ─────────────────────────────────────────
function SettingsRow({
  label,
  leftIcon,
  leftIconColor,
  rightContent,
  showChevron = true,
  onPress,
  isLast = false,
  labelColor,
  haptic,
}: {
  label: string;
  leftIcon?: React.ReactNode;
  leftIconColor?: string;
  rightContent?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  isLast?: boolean;
  labelColor?: string;
  haptic?: HapticType;
}) {
  const content = (
    <>
      <View style={styles.rowInner}>
        {leftIcon && <View style={styles.rowLeftIcon}>{leftIcon}</View>}
        <Text
          style={[TYPE.body, { color: labelColor ?? COLORS.text, flex: 1 }]}
        >
          {label}
        </Text>
        <View style={styles.rowRight}>
          {rightContent}
          {showChevron && (
            <ChevronRight size={16} color={COLORS.textMuted} />
          )}
        </View>
      </View>
      {!isLast && <View style={styles.separator} />}
    </>
  );

  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        scaleDown={0.98}
        haptic={haptic}
        style={styles.settingsRow}
      >
        {content}
      </PressableScale>
    );
  }

  return <View style={styles.settingsRow}>{content}</View>;
}

// ── Section Label ────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={styles.sectionLabel}>{label.toUpperCase()}</Text>
  );
}

// ── Glass Group ──────────────────────────────────────────
function GlassGroup({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.glassGroup}>
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.bgGlass }]}
      />
      {children}
    </View>
  );
}

// ── Camera Button ────────────────────────────────────────
function CameraButton({ onPress }: { onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} scaleDown={0.9} style={styles.cameraButton}>
      <Camera size={16} color="#fff" />
    </PressableScale>
  );
}

// ── Screen ───────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const name = useUserStore((s) => s.name);
  const quitDate = useUserStore((s) => s.quitDate);
  const resetStreakAction = useUserStore((s) => s.resetStreak);
  const clearAllData = useUserStore((s) => s.clearAllData);
  const refreshProStatus = useProStatusStore((s) => s.refreshProStatus);

  const handleRestore = async () => {
    try {
      const result = await restorePurchases();
      if (result.success) {
        refreshProStatus().catch((err) =>
          console.error('Failed to refresh after restore:', err)
        );
        Alert.alert('Restored', 'Your purchases have been restored.');
      } else {
        Alert.alert(
          'No Purchases Found',
          "We couldn't find any previous purchases to restore."
        );
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    }
  };

  return (
    <ScreenWrapper scrollable>
      <View style={{ paddingBottom: 100 }}>
        <Text style={[TYPE.heading, { color: COLORS.text }]}>My Account</Text>

        <View style={{ height: SPACING.lg }} />

        {/* ── Profile Card ── */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={48} color={COLORS.textMuted} />
            </View>
            <CameraButton onPress={() => Alert.alert('Coming soon', 'Photo picker will be available in a future update.')} />
          </View>

          {/* Name */}
          <Text style={[TYPE.heading, { color: COLORS.text, textAlign: 'center', marginTop: SPACING.md }]}>
            {name || 'Fein'}
          </Text>

          {/* Join date */}
          <Text style={[TYPE.caption, { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xs }]}>
            {quitDate ? `Joined ${getJoinDateString(quitDate)}` : ''}
          </Text>
        </View>

        <View style={{ height: SPACING.xl }} />

        {/* ── Actions ── */}
        <View>
        <SectionLabel label="Actions" />
        <GlassGroup>
          <SettingsRow
            label="Share My Progress"
            leftIcon={
              <Share2 size={18} color={COLORS.textSecondary} />
            }
            onPress={() => router.push('/share-progress' as any)}
          />
          <SettingsRow
            label="Export My Data"
            leftIcon={
              <Download size={18} color={COLORS.textSecondary} />
            }
            onPress={() => router.push('/export-data' as any)}
          />
          <SettingsRow
            label="Reset Streak"
            leftIcon={<RotateCcw size={18} color={COLORS.danger} />}
            labelColor={COLORS.danger}
            onPress={() =>
              Alert.alert('Reset Streak?', 'This cannot be undone.', [
                { text: 'Cancel' },
                { text: 'Reset', style: 'destructive', onPress: () => resetStreakAction() },
              ])
            }
            haptic="Heavy"
          />
          <SettingsRow
            label="Restart Onboarding"
            leftIcon={<RefreshCw size={18} color={COLORS.danger} />}
            labelColor={COLORS.danger}
            haptic="Heavy"
            onPress={() =>
              Alert.alert('Restart Onboarding?', 'This will erase all your data and start fresh.', [
                { text: 'Cancel' },
                {
                  text: 'Restart',
                  style: 'destructive',
                  onPress: async () => {
                    clearAllData();
                    await AsyncStorage.removeItem('hasSeenOnboarding');
                    router.replace('/onboarding/welcome' as any);
                  },
                },
              ])
            }
          />
          <SettingsRow
            label="Delete Account"
            leftIcon={<Trash2 size={18} color={COLORS.danger} />}
            labelColor={COLORS.danger}
            showChevron={false}
            haptic="Heavy"
            onPress={() =>
              Alert.alert(
                'Delete Account?',
                'This will permanently delete all your data including your streak, settings, and progress. This action cannot be undone.',
                [
                  { text: 'Cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      clearAllData();
                      await AsyncStorage.clear();
                      router.replace('/onboarding/welcome' as any);
                    },
                  },
                ],
              )
            }
            isLast
          />
        </GlassGroup>
        </View>

        <View style={{ height: SPACING.md }} />

        {/* ── About ── */}
        <View>
        <SectionLabel label="About" />
        <GlassGroup>
          <SettingsRow
            label="Rate Fein"
            leftIcon={<Star size={18} color={COLORS.textSecondary} />}
            onPress={async () => {
              try {
                const StoreReview = require('expo-store-review');
                if (await StoreReview.isAvailableAsync()) {
                  await StoreReview.requestReview();
                }
              } catch {
                Alert.alert('Coming soon');
              }
            }}
          />
          <SettingsRow
            label="Privacy Policy"
            leftIcon={<Shield size={18} color={COLORS.textSecondary} />}
            onPress={() => Linking.openURL('https://feinapp.netlify.app')}
          />
          <SettingsRow
            label="Terms of Service"
            leftIcon={
              <FileText size={18} color={COLORS.textSecondary} />
            }
            onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}
          />
          <SettingsRow
            label="Manage Subscription"
            leftIcon={<CreditCard size={18} color={COLORS.textSecondary} />}
            onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')}
          />
          <SettingsRow
            label="Restore Purchases"
            leftIcon={<RefreshCw size={18} color={COLORS.textSecondary} />}
            onPress={handleRestore}
          />
          <SettingsRow
            label="Version"
            rightContent={
              <Text style={[TYPE.body, { color: COLORS.textMuted }]}>
                1.0.0
              </Text>
            }
            showChevron={false}
            isLast
          />
        </GlassGroup>
        </View>
      </View>
    </ScreenWrapper>
  );
}

// ── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  // Profile Card
  profileCard: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorderBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.bg,
  },

  // Section / Group
  sectionLabel: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  glassGroup: {
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderTopColor: COLORS.glassTopEdge,
    overflow: 'hidden',
  },

  // Row
  settingsRow: {
    height: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowLeftIcon: {
    marginRight: 12,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginHorizontal: 16,
  },

});
