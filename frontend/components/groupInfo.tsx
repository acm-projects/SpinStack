import type {User} from './momentInfo'
import type {Moment} from './momentInfo'


export default interface GroupInfo {
    name: string,
    users: User[],
    dailies: DailyInfo[],
}

export interface DailyInfo {
    moment: Moment,
    date: number,
    title: string,
    rating: number
}