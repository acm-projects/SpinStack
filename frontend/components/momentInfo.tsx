import { ImageSourcePropType } from 'react-native';

export default interface MomentInfo {
    moment: Moment,
    user: User
}

export interface Moment {
    songName: string,
    artist: string,
    start: number,
    end: number,
    length: number,
    album: ImageSourcePropType,
    vinyl: ImageSourcePropType,
    waveform: number[]
}

interface User {
    name: string,
    profilePic: ImageSourcePropType
}