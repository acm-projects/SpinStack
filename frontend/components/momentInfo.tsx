import { ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';

export default interface MomentInfo {
    moment: Moment,
    user: User,
    type: 'moment' | 'story',

}

export interface Moment {
    description: string;
    spotifyId: any;
    id: string,
    title: string,
    artist: string,
    songStart: number,
    songDuration: number,
    length: number,
    album: ImageSourcePropType,
    waveform: number[]
}

export interface User {
    name: string,
    profilePic: ImageSourcePropType | string
}