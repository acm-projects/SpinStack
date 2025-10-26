import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Animated,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import GroupProfile from '../../components/groupProfile';
import { demoGroups } from '../../components/demoMoment';
import { useGroupStore } from '../stores/useGroupStore';
import type { GroupInfo } from '../../components/groupInfo';

function ClickableTab({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ padding: 5 }}>
      <View style={[styles.tabButton, isActive && styles.tabButtonActive]}>
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

function GroupRow({ item, onPress }: { item: GroupInfo; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.groupRow}>
      {item.dailies[0].rating === -1 && <View style={styles.unseenDot} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.dailyTitle}>{item.dailies[0].title}</Text>
      </View>
      <GroupProfile
        pics={item.users.slice(0, 3).map(u => (typeof u.profilePic === 'string' ? { uri: u.profilePic } : u.profilePic))}
      />
    </TouchableOpacity>
  );
}

export default function GroupsView({ data = demoGroups }: { data?: typeof demoGroups }) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeTabs = useRef(new Animated.Value(1)).current;
  const fadeSearch = useRef(new Animated.Value(0)).current;
  const textInputRef = useRef<any>(null);
  const [tabWidth, setTabWidth] = useState(0);

  const router = useRouter();
  const setSelectedGroup = useGroupStore(s => s.setSelectedGroup);
  const buttons = ['Recent', 'Search', 'Create'];

  const toggleSearch = () => {
    const toSearch = !isSearchActive;
    if (!toSearch) textInputRef.current?.blur() && setSearchQuery('');
    setIsSearchActive(toSearch);

    Animated.parallel([
      Animated.timing(fadeTabs, { toValue: toSearch ? 0 : 1, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeSearch, { toValue: toSearch ? 1 : 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const filteredData = data
    .sort((a, b) => {
      const ratingA = a.dailies[0].rating;
      const ratingB = b.dailies[0].rating;
      if (ratingA < 0 && ratingB >= 0) return -1;
      if (ratingA >= 0 && ratingB < 0) return 1;
      return new Date(a.dailies[0].date).getTime() - new Date(b.dailies[0].date).getTime();
    })
    .filter(group => !searchQuery.trim() || group.name.toLowerCase().includes(searchQuery.toLowerCase()) || group.dailies[0].title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dailies</Text>
      </View>

      {/* Tabs / Search */}
      <View style={{ height: 70, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.View style={{ opacity: fadeTabs, position: 'absolute', width: '100%', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 10 }} onLayout={({ nativeEvent }) => setTabWidth(nativeEvent.layout.width)}>
            {buttons.map((label, i) => (
              <ClickableTab key={i} label={label} isActive={activeTab === i} onPress={() => { setActiveTab(i); if (label === 'Search') toggleSearch(); }} />
            ))}
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeSearch,
            position: 'absolute',
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F9DDC3',
            borderWidth: 4,
            borderColor: '#2E3337',
            borderRadius: 15,
            paddingHorizontal: 10,
            width: tabWidth - 20,
            height: 50,
          }}
        >
          <TouchableOpacity onPress={toggleSearch} style={{ marginRight: 10 }}>
            <Feather name="arrow-left" size={24} color="#333C42" />
          </TouchableOpacity>
          <TextInput
            placeholder="Search groups..."
            placeholderTextColor="#333C42"
            style={{ flex: 1, fontSize: 16, fontFamily: 'Jacques Francois' }}
            autoFocus={false}
            ref={textInputRef}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animated.View>
      </View>

      {/* Messages-style Group List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <GroupRow
            item={item}
            onPress={() => {
              setSelectedGroup(item);
              router.push({ pathname: '/groups/group' });
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ fontSize: 16, color: '#333C42' }}>No groups found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8DD2CA' },
  header: { paddingVertical: 20, alignItems: 'center' },
  headerTitle: { fontSize: 40, fontFamily: 'Luxurious Roman', color: '#333C42' },
  tabButton: { borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#E8C585' },
  tabButtonActive: { backgroundColor: '#F9DDC3' },
  tabText: { fontSize: 16, fontFamily: 'Jacques Francois', color: '#333C42', fontWeight: 'bold' },
  tabTextActive: { color: '#222222' },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  unseenDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#008CFF', marginRight: 12 },
  groupName: { fontSize: 18, fontFamily: 'Jacques Francois', color: '#333C42' },
  dailyTitle: { fontSize: 14, fontFamily: 'Jacques Francois', color: '#39868F' },
  separator: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginHorizontal: 15 },
});
