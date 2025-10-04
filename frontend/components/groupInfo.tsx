import User from './momentInfo'
import Moment from './momentInfo'


export default interface GroupInfo {
    name: string,
    users: User[],
    dailies: DailyInfo[],
}

interface DailyInfo {
    moment: Moment,
    date: number,
    title: string,
    rating: number
}