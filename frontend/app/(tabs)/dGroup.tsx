import { useLocalSearchParams } from "expo-router";
import GroupView from "../groups/groups";
import GroupInfo from "../../components/groupInfo"; 
import React from "react";

export default function DGroup() {
  const { moments: serialized } = useLocalSearchParams<{ moments?: string }>();
  const gs: GroupInfo[] | undefined = serialized
    ? JSON.parse(serialized)
    : undefined;

  return <GroupView data={gs} />;
}
