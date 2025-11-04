import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Animated,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import GroupProfile from '../../components/groupProfile';
import { useGroupStore } from '../stores/useGroupStore';
import type { GroupInfo } from '../../components/groupInfo';
import { supabase } from '@/constants/supabase';
import { useAuth } from '@/_context/AuthContext';

const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

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
  // Get the first 3 users who joined the group
  const firstThreeUsers = item.users.slice(0, 3);
  
  // Map to proper format for GroupProfile - filter out invalid URIs
  const profilePics = firstThreeUsers.map(u => {
    if (typeof u.profilePic === 'string') {
      // Only return URI if it's a valid non-empty string
      return u.profilePic.trim() ? { uri: u.profilePic } : require('../../assets/images/profile.png');
    }
    return u.profilePic;
  });
  
  return (
    <TouchableOpacity onPress={onPress} style={styles.groupRow}>
      {item.dailies[0]?.rating === -1 && <View style={styles.unseenDot} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.dailyTitle}>
          {item.dailies[0]?.title || 'No daily prompt yet'}
        </Text>
      </View>
      <GroupProfile
        pics={profilePics}
        scale={0.6}
      />
    </TouchableOpacity>
  );
}

export default function GroupsView({ data }: { data?: typeof GroupInfo[] }) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<GroupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const fadeTabs = useRef(new Animated.Value(1)).current;
  const fadeSearch = useRef(new Animated.Value(0)).current;
  const textInputRef = useRef<any>(null);
  const [tabWidth, setTabWidth] = useState(0);

  const router = useRouter();
  const setSelectedGroup = useGroupStore(s => s.setSelectedGroup);
  const { user } = useAuth();
  const buttons = ['Recent', 'Search', 'Create'];

  // Fetch groups from Supabase
  useEffect(() => {
    if (!user?.id) return;
    fetchUserGroups();
  }, [user?.id]);

  const fetchUserGroups = async () => {
    try {
      setLoading(true);

      // Get groups the user is a member of
      const { data: groupMembers, error: membersError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (membersError) throw membersError;

      const groupIds = groupMembers?.map(gm => gm.group_id) || [];

      if (groupIds.length === 0) {
        setGroups([]);
        setLoading(false);
        return;
      }

      // Fetch group details
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('id, name, created_at')
        .in('id', groupIds);

      if (groupsError) throw groupsError;

      // For each group, fetch members and latest daily
      const groupsWithDetails = await Promise.all(
        (groupsData || []).map(async (group) => {
          // Fetch group members ordered by join date
          const { data: members } = await supabase
            .from('group_members')
            .select(`
              user_id,
              joined_at,
              users!group_members_user_id_fkey (
                id,
                username,
                pfp_url
              )
            `)
            .eq('group_id', group.id)
            .order('joined_at', { ascending: true });

          // Fetch profile pictures
          const usersWithPfp = await Promise.all(
            (members || []).map(async (member: any) => {
              const userData = member.users;
              let pfpUrl = null;

              if (userData.pfp_url) {
                try {
                  const res = await fetch(
                    `${nUrl}/api/upload/download-url/${userData.pfp_url}`
                  );
                  if (res.ok) {
                    const { downloadURL } = await res.json();
                    pfpUrl = downloadURL;
                  }
                } catch (err) {
                  console.error('Failed to fetch pfp:', err);
                }
              }

              return {
                name: userData.username,
                profilePic: pfpUrl ? pfpUrl : require('../../assets/images/profile.png'),
              };
            })
          );

          // Fetch latest daily for this group
          const { data: dailies } = await supabase
            .from('dailies')
            .select('id, prompt, date, created_at')
            .eq('group_id', group.id)
            .order('date', { ascending: false })
            .limit(1);

          const latestDaily = dailies?.[0];
          let dailyInfo = null;

          if (latestDaily) {
            // Check if user has submitted for this daily
            const { data: submission } = await supabase
              .from('daily_submissions')
              .select('rating, moment_id')
              .eq('daily_id', latestDaily.id)
              .eq('user_id', user.id)
              .maybeSingle();

            // Create a placeholder moment for the daily
            dailyInfo = {
              moment: {
                id: submission?.moment_id || '',
                title: latestDaily.prompt,
                artist: '',
                songStart: 0,
                songDuration: 30,
                length: 180,
                album: require('../../assets/images/album.png'),
                waveform: Array(50).fill(0).map(() => Math.floor(Math.random() * 25)),
              },
              date: new Date(latestDaily.date).getTime(),
              title: latestDaily.prompt,
              rating: submission?.rating ?? -1,
            };
          } else {
            // No daily yet, create placeholder
            dailyInfo = {
              moment: {
                id: '',
                title: 'No daily yet',
                artist: '',
                songStart: 0,
                songDuration: 30,
                length: 180,
                album: require('../../assets/images/album.png'),
                waveform: Array(50).fill(0).map(() => Math.floor(Math.random() * 25)),
              },
              date: Date.now(),
              title: 'No daily prompt yet',
              rating: -1,
            };
          }

          return {
            name: group.name,
            users: usersWithPfp,
            dailies: [dailyInfo],
          } as GroupInfo;
        })
      );

      setGroups(groupsWithDetails);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSearch = () => {
    const toSearch = !isSearchActive;
    if (!toSearch) {
      textInputRef.current?.blur();
      setSearchQuery('');
    }
    setIsSearchActive(toSearch);

    Animated.parallel([
      Animated.timing(fadeTabs, { 
        toValue: toSearch ? 0 : 1, 
        duration: 200, 
        useNativeDriver: true 
      }),
      Animated.timing(fadeSearch, { 
        toValue: toSearch ? 1 : 0, 
        duration: 200, 
        useNativeDriver: true 
      }),
    ]).start();
  };

  const filteredData = groups
    .sort((a, b) => {
      const ratingA = a.dailies[0]?.rating ?? 0;
      const ratingB = b.dailies[0]?.rating ?? 0;
      
      // Unrated dailies first
      if (ratingA < 0 && ratingB >= 0) return -1;
      if (ratingA >= 0 && ratingB < 0) return 1;
      
      // Then sort by date (most recent first)
      return (b.dailies[0]?.date ?? 0) - (a.dailies[0]?.date ?? 0);
    })
    .filter(group => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        group.name.toLowerCase().includes(query) ||
        group.dailies[0]?.title.toLowerCase().includes(query)
      );
    });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Groups</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#333C42" />
          <Text style={{ 
            marginTop: 10, 
            fontFamily: 'Jacques Francois', 
            color: '#333C42' 
          }}>
            Loading groups...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Groups</Text>
      </View>

      {/* Tabs / Search */}
      <View style={{ height: 70, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.View style={{ 
          opacity: fadeTabs, 
          position: 'absolute', 
          width: '100%', 
          alignItems: 'center' 
        }}>
          <View 
            style={{ flexDirection: 'row', gap: 10 }} 
            onLayout={({ nativeEvent }) => setTabWidth(nativeEvent.layout.width)}
          >
            {buttons.map((label, i) => (
              <ClickableTab 
                key={i} 
                label={label} 
                isActive={activeTab === i} 
                onPress={() => { 
                  setActiveTab(i); 
                  if (label === 'Search') toggleSearch(); 
                }} 
              />
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
        keyExtractor={(item, index) => `${item.name}-${index}`}
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
            <Text style={{ fontSize: 16, color: '#333C42', fontFamily: 'Jacques Francois' }}>
              {searchQuery.trim() ? 'No groups found.' : 'You are not in any groups yet.'}
            </Text>
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
  tabButton: { 
    borderRadius: 25, 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    backgroundColor: '#E8C585' 
  },
  tabButtonActive: { backgroundColor: '#F9DDC3' },
  tabText: { 
    fontSize: 16, 
    fontFamily: 'Jacques Francois', 
    color: '#333C42', 
    fontWeight: 'bold' 
  },
  tabTextActive: { color: '#222222' },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  unseenDot: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    backgroundColor: '#008CFF', 
    marginRight: 12 
  },
  groupName: { fontSize: 18, fontFamily: 'Jacques Francois', color: '#333C42' },
  dailyTitle: { fontSize: 14, fontFamily: 'Jacques Francois', color: '#39868F' },
  separator: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginHorizontal: 15 },
});