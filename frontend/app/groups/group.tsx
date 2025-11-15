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
import { useRouter } from 'expo-router';
import type { DailyInfo } from '../../components/groupInfo';
import type { User } from '@/components/momentInfo';
import { useDailyStore } from '../stores/useDailyStore';

export default function GroupView() {
  const router = useRouter();
  const group = useGroupStore((s) => s.selectedGroup);

  const setSelectedDaily = useDailyStore(s => s.setSelectedDaily);

  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          You're cooked buddy — the group doesn't even exist.
        </Text>
      </View>
    );
  }

  // Sort newest to oldest
  const sortedDailies = useMemo(
    () => [...group.dailies].sort((a, b) => b.date - a.date),
    [group.dailies]
  );

  // Helper: find the user for a daily (customize this matching rule)
  const findUserForDaily = (daily: DailyInfo): User | undefined => {
    return group.users.find((u) => u.name === daily.moment.artist);
  };

  const renderDaily = ({ item, index }: { item: DailyInfo; index: number }) => {
    const user = findUserForDaily(item);
    const isLeft = index % 2 === 0; // alternate like chat
    const containerAlign = isLeft ? 'flex-start' : 'flex-end';
    const bubbleAlign = isLeft ? 'row' : 'row-reverse';
    const nameAlign = isLeft ? 'left' : 'right';

    return (
      <View style={[styles.dailyContainer, { alignItems: containerAlign }]}>
        {/* Username + profile picture */}
        <View style={[styles.headerRow, { flexDirection: bubbleAlign }]}>
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
          <Text style={[styles.username, { textAlign: nameAlign }]}>
            {user?.name || 'Unknown User'}
          </Text>
        </View>

        {/* The “chat bubble” daily (album image) */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.dailyBubble,
            {
              alignSelf: containerAlign,
              borderTopLeftRadius: isLeft ? 6 : 18,
              borderTopRightRadius: isLeft ? 18 : 6,
            },
          ]}
          onPress={() => {setSelectedDaily(item);router.push('/dailyProcess/daily')}}
        >
          <Image
            source={
              typeof item.moment.album === 'string'
                ? { uri: item.moment.album }
                : item.moment.album
            }
            style={styles.albumArt}
          />
          <View style={styles.dailyInfo}>
            <Text style={styles.dailyTitle}>{item.title}</Text>
            <Text style={styles.dailySubtitle}>
              {item.moment.artist} — {item.moment.title}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Date (below the bubble) */}
        <Text style={[styles.dailyDate, { textAlign: nameAlign }]}>
          {new Date(item.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerText}>{group.name}</Text>
        </View>
      </View>

      <FlatList
        data={sortedDailies}
        renderItem={renderDaily}
        keyExtractor={(item) => item.moment.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
    backgroundColor: '#3A868F',
    paddingTop: 50,
    paddingHorizontal: 14,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 80,
  },
  dailyContainer: {
    marginBottom: 26,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  profilePic: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  username: {
    color: '#eee',
    fontWeight: '600',
    fontSize: 15,
  },
  dailyBubble: {
    backgroundColor: '#364B54',
    borderRadius: 18,
    overflow: 'hidden',
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  albumArt: {
    width: 260,
    height: 260,
    resizeMode: 'cover',
  },
  dailyInfo: {
    padding: 10,
  },
  dailyTitle: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  dailySubtitle: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 2,
  },
  dailyDate: {
    marginTop: 6,
    color: '#777',
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  headerBadge: {
    backgroundColor: '#3a868f', 
    borderColor: '#2e6c73', 
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
