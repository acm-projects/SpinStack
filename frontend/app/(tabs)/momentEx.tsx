import MomentView from "../../components/newMoment";
import { useRoute, RouteProp } from "@react-navigation/native";
import MomentInfo from "../../components/momentInfo";

type RootStackParamList = {
  momentEx: { momentInfo: MomentInfo };
};

export default function MomentEx() {
  const route = useRoute<RouteProp<RootStackParamList, "momentEx">>();
  const { momentInfo } = route.params;

  return <MomentView data={momentInfo} />;
}
