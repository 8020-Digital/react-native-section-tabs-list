import * as React from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  LayoutChangeEvent,
  LayoutRectangle,
  SectionListData,
  RegisteredStyle,
  ViewStyle
} from 'react-native';

const WindowWidth = Dimensions.get('window').width;

interface IProps {
  sections: SectionListData<any>[];
  renderTab: (section: SectionListData<any> & { isActive: boolean }) => React.ReactNode;
  tabBarStyle?: ViewStyle | RegisteredStyle<ViewStyle>;
  currentIndex: number;
  onPress: (index: number) => void;
  disabled?: boolean;
}

interface ITabMeasurements {
  left: number;
  right: number;
  width: number;
  height: number;
}

interface ITabsLayoutRectangle {
  [index: number]: ITabMeasurements;
}

export interface TabBarRef {
  scrollTo: ScrollView['scrollTo'];
  scrollToEnd: ScrollView['scrollToEnd'];
  flashScrollIndicators: ScrollView['flashScrollIndicators'];
  getScrollResponder: ScrollView['getScrollResponder'];
  getScrollableNode: ScrollView['getScrollableNode'];
  getNativeScrollRef: ScrollView['getNativeScrollRef'];
}

const TabBar = React.forwardRef<TabBarRef, IProps>(({
  sections,
  renderTab,
  tabBarStyle,
  currentIndex,
  onPress,
  disabled = false
}, ref) => {
  const scrollViewRef = React.useRef<ScrollView>(null);
  const tabContainerMeasurementsRef = React.useRef<LayoutRectangle | undefined>(undefined);
  const tabsMeasurementsRef = React.useRef<ITabsLayoutRectangle>({});

  React.useImperativeHandle(ref, () => ({
    scrollTo: (...args: any[]) => scrollViewRef.current?.scrollTo(...args),
    scrollToEnd: (...args: any[]) => scrollViewRef.current?.scrollToEnd(...args),
    flashScrollIndicators: () => scrollViewRef.current?.flashScrollIndicators(),
    getScrollResponder: () => (scrollViewRef.current?.getScrollResponder() as any),
    getScrollableNode: () => scrollViewRef.current?.getScrollableNode(),
    getNativeScrollRef: () => (scrollViewRef.current?.getNativeScrollRef() as any),
  }), []);

  const getScrollAmount = React.useCallback(() => {
    const position = currentIndex;
    const pageOffset = 0;
    const containerWidth = WindowWidth;

    const tabMeasurement = tabsMeasurementsRef.current[position];
    const tabContainerMeasurements = tabContainerMeasurementsRef.current;

    // Return early if measurements aren't available
    if (!tabMeasurement || !tabContainerMeasurements) {
      return 0;
    }

    // Default values for calculations
    const tabWidth = tabMeasurement.width;
    const nextTabWidth = tabsMeasurementsRef.current[position + 1]?.width || 0;
    const tabOffset = tabMeasurement.left;
    const absolutePageOffset = pageOffset * tabWidth;

    let newScrollX = tabOffset + absolutePageOffset;
    newScrollX -= (containerWidth - (1 - pageOffset) * tabWidth - pageOffset * nextTabWidth) / 2;

    // Ensure scroll position is within bounds
    const rightBoundScroll = Math.max(tabContainerMeasurements.width - containerWidth, 0);
    newScrollX = Math.max(0, Math.min(newScrollX, rightBoundScroll));

    return newScrollX;
  }, [currentIndex]);

  React.useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: getScrollAmount(),
        animated: true
      });
    }
  }, [currentIndex, getScrollAmount]);

  const handleTabContainerLayout = React.useCallback((e: LayoutChangeEvent) => {
    tabContainerMeasurementsRef.current = (e as any).nativeEvent.layout;
  }, []);

  const handleTabLayout = React.useCallback((key: number) => (ev: LayoutChangeEvent) => {
    const { x, width, height } = (ev as any).nativeEvent.layout;
    tabsMeasurementsRef.current[key] = {
      left: x,
      right: x + width,
      width,
      height
    };
  }, []);

  const renderTabItem = React.useCallback((section: SectionListData<any>, key: number) => {
    const isActive: boolean = currentIndex === key;

    return (
      <TouchableOpacity
        onPress={() => !disabled && onPress(key)}
        key={key}
        onLayout={handleTabLayout(key)}
        disabled={disabled}
      >
        {renderTab({ isActive, ...section })}
      </TouchableOpacity>
    );
  }, [renderTab, onPress, currentIndex, handleTabLayout, disabled]);

  return (
    <View style={[{ width: WindowWidth }, tabBarStyle]}>
      <ScrollView
        ref={scrollViewRef}
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={{ flexDirection: 'row' }}
      >
        <View
          onLayout={handleTabContainerLayout}
          style={[{ flexDirection: 'row' }]}
        >
          {sections.map(renderTabItem)}
        </View>
      </ScrollView>
    </View>
  );
});

TabBar.displayName = 'TabBar';

export default TabBar;
