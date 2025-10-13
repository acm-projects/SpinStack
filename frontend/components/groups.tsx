import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import {useState} from 'react';
import {useRouter, usePathname} from 'expo-router';
import {SafeAreaView} from "react-native-safe-area-context";
import GroupInfo from './groupInfo';
import {demoGroups} from './demoMoment'
import GroupProfile from './groupProfile';



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
        opacity: isActive ? 1 : 0.5,
        
      }}
    >
        <View style = {{justifyContent: 'center',
    backgroundColor: '#272727',
    borderColor: '#0BFFE3',
    borderWidth: 2,
    borderRadius: 10,
    
     }}>
            <Text style={{fontSize: 16, color: "white", marginHorizontal: 20, marginVertical: 10}}>{label}</Text>
        </View>
      
    </TouchableOpacity>     
  );
}

function GroupClickTab({ item, onPress }: { 
  item: GroupInfo; 
  onPress: () => void; 
}) {
  return (
   <TouchableOpacity
      onPress={onPress}

    >
        <View style = {{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <View style = {{flexDirection: 'column', justifyContent: 'center'}}>
                                <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
                                {item.name}
                                </Text>

                                <Text style = {{fontSize: 15, fontWeight: 'normal', color: 'gray'}}>
                                    {item.dailies[0].title}
                                </Text>
                            </View>

                            <View>
                                {/*
                                <Image 
                                                    source = {item.users[1].profilePic}
                                                    style = {{marginLeft: 10, width: 60, height: 60, borderRadius: 50, overflow: 'hidden'}}
                                                />*/}
                                <GroupProfile pics={item.users.slice(0, 3).map(user => user.profilePic)}/>
                            </View>
                        </View>
    </TouchableOpacity>     
  );
}

export default function GroupsView({ data = demoGroups }: { data?: typeof demoGroups} ) {
    const [active, setActive] = useState<number>(0);
    const [groupActive, setActive2] = useState<number | null>();
    const router = useRouter();
    const buttons = ["Recent", "Search", "Create"];

    const pathname = usePathname();
    console.log('Current path:', pathname);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
            <View style = {{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <Text style = {{fontSize: 40, color: 'hsl(0,100%,100%)'}}>Dailies</Text>
            </View>
            
        </View>
        <View style = {[styles.main, {}]}>
            <View style = {{justifyContent: 'center', alignContent: "center"}}>
                <View style = {{flexDirection: 'row', justifyContent: 'center', gap: 20}}>
                    {[0,1,2].map((i) => (
                        <ClickableTab key = {i} label = {buttons[i]} isActive ={active == i} onPress = {() => setActive(i)}></ClickableTab>
                    ))}
                </View>
            </View>

            <View style = {{justifyContent: 'flex-start', alignContent: "center", marginBottom: 60}}>
                <FlatList
                    data={data}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                    <View
                        style={{
                        backgroundColor: "#3D3D3D",
                        padding: 15,
                        borderRadius: 10,
                        marginTop: 5,
                        }}
                    >   
                        <GroupClickTab item = {item} onPress = {() => router.push('../../../components/group')}></GroupClickTab>
                    </View>
                    )}
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
        flex: 0.9, borderWidth: 0, borderColor: 'hsl(0,100%,100%)'
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