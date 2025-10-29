import React from 'react';
import MomentView from '../../components/newMoment';
import { useMomentInfoStore } from '../stores/useMomentInfoStore';
import { View, Text } from 'react-native';


export default function Stack() {
  const selectedMomentInfo = useMomentInfoStore((s) => s.selectedMomentInfo);

  if (!selectedMomentInfo) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF0E2' }}>
        <Text style={{ fontFamily: 'Jacques Francois', fontSize: 18, color: '#333C42' }}>
          No moment selected
        </Text>
      </View>
    );
  }

  return <MomentView data={selectedMomentInfo} />;
}