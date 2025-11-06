import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useGroupStore } from '../stores/useGroupStore';
import { RelativePathString, useRouter } from 'expo-router';
import type { DailyInfo } from '../../components/groupInfo';
import type { User } from '@/components/momentInfo';

export default function GroupView() {
  const router = useRouter();
  const group = useGroupStore((s) => s.selectedGroup);

  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          You're cooked buddy — the group doesn't even exist.
        </Text>
      </View>
    );
  }

  // Sort dailies by date descending (latest first)
  const sortedDailies = useMemo(
    () => [...group.dailies].sort((a, b) => b.date - a.date),
    [group.dailies]
  );

  // Find the user who submitted a given daily (assuming matching `moment.id` or something similar)
  const findUserForDaily = (daily: DailyInfo): User | undefined => {
    return group.users.find((u) => u.name === daily.moment.artist); // Replace logic if you have a user field in DailyInfo
  };

  const renderDaily = ({ item }: { item: DailyInfo }) => {
    const user = findUserForDaily(item);
    return (
      <TouchableOpacity
        style={styles.dailyBubble}
        activeOpacity={0.8}
        onPress={() => router.push('/dailyView' as RelativePathString)}
      >
        {/* Profile picture */}
        {user && (
          <Image
            source={
              typeof user.profilePic === 'string'
                ? { uri: user.profilePic }
                : user.profilePic
            }
            style={styles.profilePic}
          />
        )}

        {/* Daily content */}
        <View style={styles.dailyContent}>
          <Image
            source={
              typeof item.moment.album === 'string'
                ? { uri: item.moment.album }
                : item.moment.album
            }
            style={styles.albumArt}
          />
          <View style={styles.dailyTextContainer}>
            <Text style={styles.dailyTitle}>{item.title}</Text>
            <Text style={styles.dailySubtitle}>
              {item.moment.artist} — {item.moment.title}
            </Text>
            <Text style={styles.dailyDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{group.name}</Text>
      <FlatList
        data={sortedDailies}
        renderItem={renderDaily}
        keyExtractor={(item) => item.moment.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

export const options = {
  headerShown: false,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8DD2CA',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    fontSize: 26,
    fontWeight: '600',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  dailyBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    borderColor: "#333C42",
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  profilePic: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },
  dailyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  albumArt: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 12,
  },
  dailyTextContainer: {
    flexShrink: 1,
  },
  dailyTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  dailySubtitle: {
    color: '#bbb',
    fontSize: 14,
    marginBottom: 3,
  },
  dailyDate: {
    color: '#3A868F',
    fontSize: 12,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
 