import React, {useEffect} from 'react';
import { View, Text} from 'react-native';
import DailyView from '../../components/daily'
import GroupInfo from "../../components/groupInfo";
import { useGroupStore } from '../stores/useGroupStore';


export default function GroupView() {
  const group = useGroupStore((s) => s.selectedGroup);
  if(!group) {
      return (<View style = {{backgroundColor: 'red'}}><Text>you're cooked buddy the group doesn't even exist</Text></View>);
  }
  return (
    <DailyView daily = {group.dailies[0]} users = {group.users}/>
  );
}

export const options = {
  headerShown: false
}