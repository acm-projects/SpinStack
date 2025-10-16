import { useLocalSearchParams } from 'expo-router';
import GroupView from '../groups/groups';
import GroupInfo from '../../components/groupInfo';

export default function dGroup() {
  const { moments: serialized } = useLocalSearchParams<{ moments?: string }>();
  const gs: GroupInfo[] = serialized ? JSON.parse(serialized) : undefined;

  return <GroupView data={gs} />;
}
