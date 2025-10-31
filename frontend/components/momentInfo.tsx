import { ImageSourcePropType } from 'react-native';

export default interface MomentInfo {
    moment: Moment,
    user: User
}

export interface Moment {
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