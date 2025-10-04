import { useLocalSearchParams } from 'expo-router';
import StackView from '../../components/stackView';
import MomentInfo from '../../components/momentInfo';

export default function Stack() {
  const { moments: serialized } = useLocalSearchParams<{ moments?: string }>();
  const moments: MomentInfo[] = serialized ? JSON.parse(serialized) : undefined;

  return <StackView moments={moments} />;
}
