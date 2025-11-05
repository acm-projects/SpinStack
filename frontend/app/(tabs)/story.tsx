import React from 'react';
import { View, Text } from 'react-native';
import { useMomentInfoStore } from '../stores/useMomentInfoStore'; // adjust import
import MomentView from '@/components/newMoment'; // same component you use in stack

export default function Story() {
    const selectedMomentInfo = useMomentInfoStore((s) => s.selectedMomentInfo);

    if (!selectedMomentInfo) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#FFF0E2',
                }}
            >
                <Text
                    style={{
                        fontFamily: 'Jacques Francois',
                        fontSize: 18,
                        color: '#333C42',
                    }}
                >
                    No story selected
                </Text>
            </View>
        );
    }

    return <MomentView data={selectedMomentInfo} />;
}
