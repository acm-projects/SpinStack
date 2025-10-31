import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Animated,
  TextInput,
  Easing,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import GroupProfile from '../../components/groupProfile';
import { useGroupStore } from '../stores/useGroupStore';
import { demoGroups } from '../../components/demoMoment';
import type { DailyInfo } from '../../components/groupInfo';
import * as Font from "expo-font";



// ======= ICON TAB =======
function ClickableTab({
  icon,
  isActive,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={{padding: 10,}}>
      <Feather
        name={icon}
        size={28}
        color={isActive ? '#ffffffff' : '#ffffffff'}
        style={{
          opacity: isActive ? 1 : 0.6,
        }}
      />
    </TouchableOpacity>
  );
}


// ======= GROUP ITEM =======
function GroupClickTab({
  item,
  onPress,
}: {
  item: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.groupRow}>
        {/* Unread dot */}
        {item.dailies[0].rating === -1 && (
          <View style={styles.unreadDotContainer}>
            <View style={styles.unreadDot} />
          </View>
        )}

        {/* Text info */}
        <View style={styles.groupTextContainer}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupTitle}>{item.dailies[0].title}</Text>
        </View>

        <View style = {{ paddingRight: 23}}>
        <GroupProfile
          pics={item.users.slice(0, 3).map((user) =>
            typeof user.profilePic === 'string'
              ? { uri: user.profilePic }
              : user.profilePic
          )}
        />
            
        </View>
        {/* Profile pictures */}
        
      </View>
      <View style={styles.separatorLine} />
    </TouchableOpacity>
  );
}

// ======= MAIN COMPONENT =======
export default function GroupsView({
  data = demoGroups,
}: {
  data?: typeof demoGroups;
}) {
  const [active, setActive] = useState<number>(0);
  const router = useRouter();
  const setSelectedGroup = useGroupStore((s) => s.setSelectedGroup);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const fadeTabs = useRef(new Animated.Value(1)).current;
  const fadeSearch = useRef(new Animated.Value(0)).current;
  const textInputRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabWidth, setTabWidth] = useState(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      "Luxurious Roman": require("@/fonts/LuxuriousRoman-Regular.ttf"),
      "Jacques Francois": require("@/fonts/JacquesFrancois-Regular.ttf"),
      "Lato": require("@/fonts/Lato-Regular.ttf"),
      "LatoBold": require("@/fonts/Lato-Bold.ttf"),
      "LatoItalic": require("@/fonts/Lato-Italic.ttf")
    });
    setFontsLoaded(true);
  };
  // Filter and sort groups
  const filteredData = [...data]
    .sort((a, b) => {
      const ratingA = a.dailies[0].rating;
      const ratingB = b.dailies[0].rating;
      const dateA = new Date(a.dailies[0].date);
      const dateB = new Date(b.dailies[0].date);

      if (ratingA < 0 && ratingB >= 0) return -1;
      if (ratingA >= 0 && ratingB < 0) return 1;
      return dateA.getTime() - dateB.getTime();
    })
    .filter((group) => {
      if (!searchQuery.trim()) return true;
      const lowerQuery = searchQuery.toLowerCase();
      return (
        group.name.toLowerCase().includes(lowerQuery) ||
        group.dailies[0].title.toLowerCase().includes(lowerQuery)
      );
    });

  const toggleSearch = () => {
    const toSearch = !isSearchActive;
    if (!toSearch) {
      textInputRef.current?.blur();
      textInputRef.current?.clear();
      setSearchQuery('');
    }
    setIsSearchActive(toSearch);

    Animated.parallel([
      Animated.timing(fadeTabs, {
        toValue: toSearch ? 0 : 1,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeSearch, {
        toValue: toSearch ? 1 : 0,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const buttons = [
    { icon: 'clock' as const },
    { icon: 'search' as const },
    { icon: 'plus-circle' as const },
  ];

  const background = require('../../assets/images/groupBackground.png');

  return (
    <ImageBackground source={background} style={styles.backgroundImage}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Dailies</Text>
        </View>

        {/* TABS + SEARCH BAR */}
        <View style={styles.tabArea}>
          <Animated.View
            style={{
              opacity: fadeTabs,
              position: 'absolute',
              width: '100%',
              alignItems: 'center',
            }}
            onLayout={({ nativeEvent }) => setTabWidth(nativeEvent.layout.width)}
          >
            <View style={styles.tabsRow}>
              {buttons.map((btn, i) => (
                <ClickableTab
                  key={i}
                  icon={btn.icon}
                  isActive={active === i}
                  onPress={() => {
                    setActive(i);
                    if (btn.icon === 'search') toggleSearch();
                  }}
                />
              ))}
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.searchBar,
              {
                opacity: fadeSearch,
                width: tabWidth - 20,
              },
            ]}
          >
            <TouchableOpacity onPress={toggleSearch} style={{ marginRight: 10 }}>
              <Feather name="arrow-left" size={22} color="#333C42" />
            </TouchableOpacity>
            <TextInput
              ref={textInputRef}
              placeholder="Search groups..."
              placeholderTextColor="#333C42"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </Animated.View>
        </View>

        {/* GROUP LIST SECTION */}
        <FlatList
          data={filteredData}
          keyExtractor={(_, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <GroupClickTab
              item={item}
              onPress={() => {
                setSelectedGroup(item);
                router.push({ pathname: '/groups/group' });
              }}
            />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <Text style={{ fontSize: 16, color: '#ffffffff' }}>No groups found.</Text>
            </View>
          }
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

// ======= STYLES =======
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 40,
    fontFamily: 'Lato',
    fontWeight: 700,
    color: '#ffffffff',
  },
  tabArea: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 25,
  },
  searchBar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9DDC3',
    borderWidth: 3,
    borderColor: '#2E3337',
    borderRadius: 15,
    paddingHorizontal: 10,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Lato',
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  groupTextContainer: {
    flex: 1,
  },
   groupName: {
    fontSize: 20,
    fontFamily: 'Lato',
    color: '#ffffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',   // shadow color
    textShadowOffset: { width: 1, height: 1 }, // shadow position
    textShadowRadius: 3,                      // blur radius
    paddingLeft: 5,
    fontWeight: 500
  },
  groupTitle: {
    fontSize: 15,
    fontFamily: 'Lato',
    color: '#ffffffb2',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    paddingLeft: 5,
    fontStyle: 'italic'
  },
  unreadDotContainer: {
    marginRight: 8,
    paddingLeft: 7
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#008CFF',
    
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#ffffffff',
    opacity: 1,
    marginHorizontal: 20,
  },
});
