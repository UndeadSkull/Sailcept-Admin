import React from "react";
import { FontAwesome5 } from "@expo/vector-icons";

export default function CruiseTypeIcon({
  type,
  size = "compact",
}: {
  type: "day" | "overnight" | "night";
  size?: "compact" | "regular" | "large";
}) {
  const iconSize = size === "large" ? 18 : size === "regular" ? 12 : 7;

  if (type === "day") {
    return <FontAwesome5 name="sun" size={iconSize} color={"#1a7f7f"} solid />;
  }
  if (type === "overnight") {
    return <FontAwesome5 name="bed" size={iconSize} color={"#1a7f7f"} solid />;
  }
  return <FontAwesome5 name="moon" size={iconSize} color={"#1a7f7f"} solid />;
}

