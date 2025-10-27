import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Animated, TextInput, Easing, ImageSourcePropType} from 'react-native';
import {useState, useRef, useEffect} from 'react';
import { Layout, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import {useRouter, usePathname} from 'expo-router';
import {SafeAreaView} from "react-native-safe-area-context";
import GroupInfo from '../../components/groupInfo';
import {demoGroups} from '../../components/demoMoment'
import GroupProfile from '../../components/groupProfile';
import Feather from '@expo/vector-icons/Feather';
import { useGroupStore } from "../stores/useGroupStore";
import type { DailyInfo } from "../../components/groupInfo"; 

function ClickableTab({ label, isActive, onPress }: { 
  label: string; 
  isActive: boolean; 
  onPress: () => void; 
}) {
  return (
   <TouchableOpacity
      onPress={onPress}
      style={{
        padding: 10,
        opacity: isActive ? 1 : 1,
        
      }}
    >
        <View style = {{justifyContent: 'center',
    backgroundColor: isActive ? ("#F9DDC3") : ("#E8C585"),
    borderColor: '#2E3337',
    borderWidth: 3,
    borderRadius: 50,
    
     }}>
            <Text style={{fontSize: 16, fontFamily: 'Jacques Francois', color: "#333C42", marginHorizontal: 20, fontWeight: 'bold', marginVertical: 10}}>{label}</Text>
        </View>
      
    </TouchableOpacity>     
  );
}

function GroupClickTab({ item, onPress }: { 
  item: GroupInfo; 
  onPress: () => void; 
}) {
    const vinylImg = require('../../assets/images/vinyl.png')
  return (
   <TouchableOpacity
      onPress={onPress}
    >
        <View style = {{
            flexDirection: 'row', 
            justifyContent: 'space-between',
            backgroundColor: "#8DD2CA",
            }}>
                            {item.dailies[0].rating == -1 && 
                            <View style = {{justifyContent: 'center', alignItems: 'center'}}>
                                <View style = {{borderRadius: 10, height: 10, width: 10, backgroundColor: "#008CFF", marginRight: 12}}/>
                            </View>
                            }
                            <View style = {{flex: 1, flexDirection: 'column', justifyContent: 'center'}}>
                                <Text style={{ fontSize: 20, fontFamily: 'Jacques Francois', color: "#333C42" }}>
                                {item.name}
                                </Text>

                                <Text style = {{fontSize: 15, fontFamily: 'Jacques Francois', color: '#39868F'}}>
                                    {item.dailies[0].title}
                                </Text>
                            </View>

                            <View>
                                <GroupProfile pics={item.users.slice(0, 3).map(user => (typeof user.profilePic === "string"
                                        ? { uri: user.profilePic }
                                        : user.profilePic))}/>
                            </View>
                        </View>
    </TouchableOpacity>     
  );
}

export default function GroupsView({ data = demoGroups }: { data?: typeof demoGroups} ) {
    const [active, setActive] = useState<number>(0);
    const router = useRouter();
    const buttons = ["Recent", "Search", "Create"];

    const setSelectedGroup = useGroupStore((s) => s.setSelectedGroup);
    

    const [isSearchActive, setIsSearchActive] = useState(false);
    const fadeTabs = useRef(new Animated.Value(1)).current;   // starts fully visible
    const fadeSearch = useRef(new Animated.Value(0)).current; // starts invisible
    const textInputRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [tabWidth, setTabWidth] = useState(0);

    const filteredData = [...data].sort((a, b) => {
        const ratingA = a.dailies[0].rating;
        const ratingB = b.dailies[0].rating;
        const dateA = new Date(a.dailies[0].date);
        const dateB = new Date(b.dailies[0].date);

        //make not done groups come first
        if (ratingA < 0 && ratingB >= 0) return -1;
        if (ratingA >= 0 && ratingB < 0) return 1;

        // then by date
        return dateA.getTime() - dateB.getTime();
    }).filter(group => {
        if (!searchQuery.trim()) return true;//show all if empty
        const lowerQuery = searchQuery.toLowerCase();
        return (
            group.name.toLowerCase().includes(lowerQuery) ||
            group.dailies[0].title.toLowerCase().includes(lowerQuery)
        );
    });


    const toggleSearch = () => {
        const toSearch = !isSearchActive;
        if(!toSearch) {
            textInputRef.current.blur();
            textInputRef.current.clear();
            setSearchQuery('')
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


  return (
    <SafeAreaView style={[styles.container, {backgroundColor: "#FFF0E2"}]} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
            <View style = {{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <Text style = {{fontSize: 40, fontFamily: 'Luxurious Roman', color: '#333C42'}}>Dailies</Text>
            </View>
            
        </View>
        <View style = {[styles.main, {}]}>
            <View style={{ height: 67, justifyContent: 'center', alignItems: 'center' }}>
                <Animated.View
                    style={{
                    opacity: fadeTabs,
                    position: 'absolute',
                    width: '100%',
                    alignItems: 'center',
                    
                    }}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}
                    onLayout={({ nativeEvent }) => {
                        const { width } = nativeEvent.layout;
                        setTabWidth(width);
                    }}
                    >
                    {buttons.map((label, i) => (
                        <ClickableTab
                        key={i}
                        label={label}
                        isActive={active === i}
                        onPress={() => {
                            setActive(i);
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
                    borderRadius: 20,
                    paddingHorizontal: 10,
                    width: tabWidth-20,
                    height: 50,
                    }}
                >
                    <TouchableOpacity onPress={toggleSearch} style = {{marginLeft: 5, marginRight: 10}}>
                    <Feather name="arrow-left" size={24} color="black"/>
                    </TouchableOpacity>
                    <TextInput
                    placeholder="Search groups..."
                    placeholderTextColor="#333C42"
                    style={{ flex: 1, fontSize: 16, fontFamily: "Jacques Francois"}}
                    autoFocus = {false}
                    ref = {textInputRef}
                    value = {searchQuery}
                    onChangeText = {setSearchQuery}
                    />
                </Animated.View>
            </View>



            <View style = {{justifyContent: 'flex-start', alignContent: "center", marginBottom: 160}}>
                <FlatList
                    data={filteredData}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                    <View
                        style={{
                        backgroundColor: "#8DD2CA",
                        padding: 15,
                        marginHorizontal: 5,
                        borderRadius: 10,
                        marginTop: 5,
                        borderWidth: 4, 
                        borderColor: "#333C42",
                        }}
                    >   
                        <GroupClickTab item = {item} 
                            
                            onPress={() => {
                                        setSelectedGroup(item); 
                                        router.push({pathname: "/groups/group"})}}
                                        ></GroupClickTab>
                    </View>
                    )}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <Text style={{ fontSize: 16, color: '#333C42' }}>No groups found.</Text>
                        </View>
                    }
                />
                
            </View>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        /*backgroundColor: '#fffefe69',*/
        borderColor: 'hsl(0,100%,100%)',
    },
    header: {
        flex: 0.1,
    },
    main: {
        flex: 1, borderWidth: 0, borderColor: 'hsl(0,100%,100%)'
    },
    foot: {
        flex: 0.12,
    },
    test: {
        /*borderWidth: 3*/
    },
    texxt: {
        fontSize: 20,
        color: 'hsl(0, 100%, 100%)'
    }
})