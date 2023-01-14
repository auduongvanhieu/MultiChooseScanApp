import { observer } from "mobx-react-lite";
import React, { FC } from "react";
import { View, ViewStyle } from "react-native";
import { AppStackScreenProps } from "../navigators"; // @demo remove-current-line
import { colors } from "../theme";

interface ScanMultiChooseByCameraScreenProps extends AppStackScreenProps<"ScanMultiChooseByCamera"> { } // @demo remove-current-line

export const ScanMultiChooseByCameraScreen: FC<ScanMultiChooseByCameraScreenProps> = observer(function ScanMultiChooseByCameraScreen(
  _props,
) {

  return (
    <View style={$container}>
    </View>
  )
})

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}
