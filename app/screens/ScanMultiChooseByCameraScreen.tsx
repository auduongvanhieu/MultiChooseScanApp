import { observer } from "mobx-react-lite";
import React, { FC, useEffect, useState, useRef } from "react";
import { DeviceEventEmitter, Platform, View, ViewStyle } from "react-native";
import { AppStackScreenProps } from "../navigators"; // @demo remove-current-line
import { colors } from "../theme";
import { RNCv, Mat, CvType, CvSize, CvPoint, CvScalar, CvCamera, CvInvoke } from 'react-native-opencv3';

interface ScanMultiChooseByCameraScreenProps extends AppStackScreenProps<"ScanMultiChooseByCamera"> { } // @demo remove-current-line

export const ScanMultiChooseByCameraScreen: FC<ScanMultiChooseByCameraScreenProps> = observer(function ScanMultiChooseByCameraScreen(
  _props,
) {

  var overlayMat = null;
  var cvCamera: any = useRef();
  const [interMat, setInterMat] = useState(null);
  const [circlesMat, setCirclesMat] = useState(null);

  useEffect(() => {
    DeviceEventEmitter.addListener('onPayload', onPayload)
    DeviceEventEmitter.addListener('onFrameSize', onFrameSize)
    onRefesh()
    console.log('hieunv', 'ScanMultiChooseByCameraScreen');
  }, [])

  const onRefesh = async () => {
    const interMat = await new Mat().init()
    const circlesMat = await new Mat().init()
    setInterMat(interMat)
    setCirclesMat(circlesMat)
  }

  const onFrameSize = async (e) => {
    if (!overlayMat) {
      const { frameWidth, frameHeight } = JSON.parse((Platform.OS === 'ios') ? e.nativeEvent.payload : e.payload).frameSize
      if (Platform.OS === 'ios') { // portrait
        overlayMat = await new Mat(frameHeight, frameWidth, CvType.CV_8UC4).init()
      }
      else { // landscape or portrait
        overlayMat = await new Mat(frameWidth, frameHeight, CvType.CV_8UC4).init()
      }
      // setOverlayMat(overlayMat)
    }
  }

  const onPayload = async (e) => {
    //alert('Entered onPayload e is: ' + JSON.stringify(e))
    const circles = (Platform.OS === 'ios') ? e.nativeEvent.payload : e.payload
    console.log('hieunv', 'overlayMat', overlayMat);
    if (overlayMat) {
      overlayMat.setTo(CvScalar.all(0))
      const scalar1 = new CvScalar(255, 0, 255, 255)
      const scalar2 = new CvScalar(255, 255, 0, 255)

      for (let i = 0; i < circles.length; i += 3) {
        const center = new CvPoint(Math.round(circles[i]), Math.round(circles[i + 1]))
        const radius = Math.round(circles[i + 2])
        console.log('hieunv', 'center', center);
        RNCv.invokeMethod("circle", { "p1": overlayMat, "p2": center, "p3": 3, "p4": scalar1, "p5": 3, "p6": 8, "p7": 0 })
        RNCv.invokeMethod("circle", { "p1": overlayMat, "p2": center, "p3": radius, "p4": scalar2, "p5": 10, "p6": 8, "p7": 0 })
      }

      if (cvCamera && cvCamera.current) {
        // have to do this for performance ...
        cvCamera.current.setOverlay(overlayMat)
      }
    }
  }

  const renderHoughCircles = () => {
    const gaussianKernelSize = new CvSize(9, 9)
    let overlayInt = 100

    if (interMat && circlesMat) {
      return (
        <CvInvoke func='HoughCircles' params={{ "p1": interMat, "p2": circlesMat, "p3": 3, "p4": 2, "p5": 320, "p6": 200, "p7": 100, "p8": 5, "p9": 130 }} callback='onPayload'>
          <CvInvoke func='GaussianBlur' params={{ "p1": "gray", "p2": interMat, "p3": gaussianKernelSize, "p4": 2, "p5": 2 }}>
            <CvCamera ref={cvCamera} style={container}
              overlayInterval={overlayInt}
              onPayload={onPayload}
              onFrameSize={onFrameSize}
            />
          </CvInvoke>
        </CvInvoke>
      )
    } else {
      return (
        <View />
      )
    }
  }

  return (
    <View style={$container}>
      {renderHoughCircles()}
    </View>
  )
})

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const container: ViewStyle = {
  width: '100%',
  height: '100%',
  backgroundColor: 'transparent',
  position: 'absolute',
}