import * as React from 'react';
import {
  View,
  SectionList as RNSectionList,
  SectionListProps,
  ViewStyle,
  RegisteredStyle,
  SectionListData
} from 'react-native';
import TabBar, { TabBarRef } from './TabBar';

// Declare global setTimeout for TypeScript
declare const setTimeout: (callback: (...args: any[]) => void, delay?: number) => number;
declare const clearTimeout: (id: number) => void;

export interface SectionListRef {
  scrollToLocation: (params: any) => void;
  scrollToEnd: (params?: { animated?: boolean }) => void;
  scrollToOffset: (params: { offset: number; animated?: boolean }) => void;
  scrollToIndex: (params: any) => void;
  flashScrollIndicators: () => void;
  getNativeScrollRef: () => any;
  getScrollResponder: () => any;
  getScrollableNode: () => any;
}

interface IProps extends SectionListProps<any> {
  tabBarStyle?: ViewStyle | RegisteredStyle<ViewStyle>;
  renderTab: (section: SectionListData<any> & { isActive: boolean }) => React.ReactNode;
  sections: ReadonlyArray<SectionListData<any>>;
  onSectionsReady?: () => void;
}

export interface SectionListWithTabsRef {
  sectionList: SectionListRef;
  tabBar: TabBarRef;
  scrollToSection: (index: number) => void;
}

const SectionList = React.forwardRef<SectionListWithTabsRef, IProps>(({
    sections,
    renderTab,
    tabBarStyle,
    onSectionsReady,

    ...restProps
  }, ref) => {
      const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const blockUpdateIndexRef = React.useRef<boolean>(false);
    const sectionListRef = React.useRef<RNSectionList<any>>(null);
  const tabBarRef = React.useRef<TabBarRef>(null);
  
  // Track section positions dynamically
  const sectionPositionsRef = React.useRef<{ [key: number]: number }>({});
  const sectionMeasurementsRef = React.useRef<{ [key: number]: { headerHeight: number; itemHeights: number[] } }>({});
  const [sectionsReady, setSectionsReady] = React.useState(false);
  const pendingScrollIndexRef = React.useRef<number | null>(null);



      const prepareSections = React.useMemo(
      () =>
        sections.map((item: SectionListData<any>, index: number) => ({
          ...item,
          index
        })),
      [sections]
    );

    // Debounce ref to prevent excessive recalculations
    const debounceTimerRef = React.useRef<number | null>(null);

    // Calculate section positions based on actual measurements
    const calculateSectionPositions = React.useCallback(() => {
      // Debounce calculations to avoid excessive updates during rapid layout changes
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const positions: { [key: number]: number } = {};
        let cumulativeHeight = 0;

        prepareSections.forEach((section, index) => {
          positions[index] = cumulativeHeight;

          const measurements = sectionMeasurementsRef.current[index];
          if (measurements) {
            // Use actual measured heights
            const sectionHeaderHeight = measurements.headerHeight;
            const totalItemsHeight = measurements.itemHeights.reduce((sum, height) => {
              // Add item height plus margin (assuming 8px margin as before)
              return sum + height + 8;
            }, 0);

            cumulativeHeight += sectionHeaderHeight + totalItemsHeight;
          } else {
            // Fallback to estimated heights if measurements aren't ready yet
            const sectionHeaderHeight = 60;
            const estimatedItemHeight = 100; // Default estimate
            const totalItemsHeight = section.data.length * (estimatedItemHeight + 8);
            cumulativeHeight += sectionHeaderHeight + totalItemsHeight;
          }
        });

        sectionPositionsRef.current = positions;
        setSectionsReady(true);

        // Call the callback to notify that sections are ready
        if (onSectionsReady) {
          onSectionsReady();
        }

        // Execute pending scroll if there is one
        if (pendingScrollIndexRef.current !== null) {
          const pendingIndex = pendingScrollIndexRef.current;
          pendingScrollIndexRef.current = null;

          // Execute the scroll with calculated positions
          const sectionList = sectionListRef.current;
          if (sectionList) {
            let targetY = positions[pendingIndex] || 0;

            // Adjust to show the first item instead of the header
            const measurements = sectionMeasurementsRef.current[pendingIndex];
            if (measurements && measurements.headerHeight > 0) {
              targetY += measurements.headerHeight;
            } else {
              // Fallback: estimate header height
              targetY += 60;
            }

            const scrollResponder = sectionList.getScrollResponder?.();
            if (scrollResponder && scrollResponder.scrollTo) {
              scrollResponder.scrollTo({
                x: 0,
                y: targetY,
                animated: true,
              });
            }
          }
        }
      }, 100); // 100ms debounce
    }, [prepareSections]);

    // Calculate positions when sections change or component mounts
    React.useEffect(() => {
      calculateSectionPositions();
    }, [calculateSectionPositions]);

    // Cleanup debounce timer on unmount
    React.useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);

    // Handlers for measuring section headers and items
    const handleSectionHeaderLayout = React.useCallback((sectionIndex: number, event: { nativeEvent: { layout: { height: number } } }) => {
      const { height } = event.nativeEvent.layout;
      const currentMeasurements = sectionMeasurementsRef.current[sectionIndex] || { headerHeight: 0, itemHeights: [] };
      currentMeasurements.headerHeight = height;
      sectionMeasurementsRef.current[sectionIndex] = currentMeasurements;

      // Recalculate positions after measurement
      calculateSectionPositions();
    }, [calculateSectionPositions]);

    const handleItemLayout = React.useCallback((sectionIndex: number, itemIndex: number, event: { nativeEvent: { layout: { height: number } } }) => {
      const { height } = event.nativeEvent.layout;
      const currentMeasurements = sectionMeasurementsRef.current[sectionIndex] || { headerHeight: 0, itemHeights: [] };
      currentMeasurements.itemHeights[itemIndex] = height;
      sectionMeasurementsRef.current[sectionIndex] = currentMeasurements;

      // Recalculate positions after measurement
      calculateSectionPositions();
    }, [calculateSectionPositions]);

    React.useImperativeHandle(ref, () => ({
      sectionList: {
        scrollToLocation: (params: any) => (sectionListRef.current as any)?.scrollToLocation(params),
        scrollToEnd: (params?: { animated?: boolean }) => (sectionListRef.current as any)?.scrollToEnd(params),
        scrollToOffset: (params: { offset: number; animated?: boolean }) => (sectionListRef.current as any)?.scrollToOffset(params),
        scrollToIndex: (params: any) => (sectionListRef.current as any)?.scrollToIndex(params),
        flashScrollIndicators: () => sectionListRef.current?.flashScrollIndicators(),
        getNativeScrollRef: () => (sectionListRef.current as any)?.getNativeScrollRef(),
        getScrollResponder: () => (sectionListRef.current as any)?.getScrollResponder(),
        getScrollableNode: () => (sectionListRef.current as any)?.getScrollableNode(),
      },
      tabBar: {
        scrollTo: (...args: any[]) => tabBarRef.current?.scrollTo(...args),
        scrollToEnd: (...args: any[]) => tabBarRef.current?.scrollToEnd(...args),
        flashScrollIndicators: () => tabBarRef.current?.flashScrollIndicators(),
        getScrollResponder: () => (tabBarRef.current?.getScrollResponder() as any),
        getScrollableNode: () => tabBarRef.current?.getScrollableNode(),
        getNativeScrollRef: () => (tabBarRef.current?.getNativeScrollRef() as any),
      },
      scrollToSection: (index: number) => {
        const sectionList = sectionListRef.current;
        if (sectionList && sectionsReady) {
          // Use dynamically calculated positions
          let targetY = sectionPositionsRef.current[index] || 0;

          // Adjust to show the first item instead of the header
          const measurements = sectionMeasurementsRef.current[index];
          if (measurements && measurements.headerHeight > 0) {
            targetY += measurements.headerHeight;
          } else {
            // Fallback: estimate header height
            targetY += 60;
          }

          // Get the scroll responder and scroll directly
          const scrollResponder = sectionList.getScrollResponder?.();
          if (scrollResponder && scrollResponder.scrollTo) {
            scrollResponder.scrollTo({
              x: 0,
              y: targetY,
              animated: true,
            });
          }
        } else {
          // Store pending scroll index for when sections are ready
          pendingScrollIndexRef.current = index;
          if (!sectionsReady) {
            // Try to calculate positions immediately
            calculateSectionPositions();
          }
        }
      }
    }), [sectionsReady, calculateSectionPositions]);

    const handleTabPress = React.useCallback(
      (index: number) => {
        setCurrentIndex(index);
        blockUpdateIndexRef.current = true;

        const sectionList = sectionListRef.current;
        if (sectionList && sectionsReady) {
          // Use dynamically calculated positions
          let targetY = sectionPositionsRef.current[index] || 0;

          // Adjust to show the first item instead of the header
          const measurements = sectionMeasurementsRef.current[index];
          if (measurements && measurements.headerHeight > 0) {
            targetY += measurements.headerHeight;
          } else {
            // Fallback: estimate header height
            targetY += 60;
          }

          // Get the scroll responder and scroll directly
          const scrollResponder = sectionList.getScrollResponder?.();
          if (scrollResponder && scrollResponder.scrollTo) {
            scrollResponder.scrollTo({
              x: 0,
              y: targetY,
              animated: true,
            });
          }
        } else if (!sectionsReady) {
          // Store pending scroll index for when sections are ready
          pendingScrollIndexRef.current = index;
          // Fallback: try to calculate positions immediately
          calculateSectionPositions();
        }
      },
      [sectionsReady, calculateSectionPositions]
    );

    const handleViewableItemsChanged = React.useCallback(
      ({ viewableItems }: any) => {
        if (!blockUpdateIndexRef.current && viewableItems[0]) {
          const newCurrentIndex = viewableItems[0].section.index;
          if (currentIndex !== newCurrentIndex) {
            setCurrentIndex(newCurrentIndex);
          }
        }
      },
      [currentIndex]
    );

    const handleMomentumScrollEnd = React.useCallback(() => {
      blockUpdateIndexRef.current = false;
    }, []);

    const viewabilityConfig = React.useMemo(
      () => ({
        minimumViewTime: 10,
        itemVisiblePercentThreshold: 10
      }),
      []
    );

    return (
      <View style={{ flex: 1 }}>
        <TabBar
          ref={tabBarRef}
          sections={prepareSections}
          renderTab={renderTab}
          tabBarStyle={tabBarStyle}
          currentIndex={currentIndex}
          onPress={handleTabPress}
        />

        <RNSectionList
          {...restProps}
          sections={prepareSections}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          ref={sectionListRef}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          renderSectionHeader={(props: any) => {
            // Wrap the original renderSectionHeader to add layout measurement
            const originalRender = (restProps as any).renderSectionHeader;
            if (!originalRender) return null;

            const sectionIndex = props.section.index;
            return (
              <View onLayout={(event: any) => handleSectionHeaderLayout(sectionIndex, event)}>
                {originalRender(props)}
              </View>
            );
          }}
          renderItem={(props: any) => {
            // Wrap the original renderItem to add layout measurement
            const originalRender = (restProps as any).renderItem;
            if (!originalRender) return null;

            const sectionIndex = props.section.index;
            const itemIndex = props.index || 0;
            return (
              <View onLayout={(event: any) => handleItemLayout(sectionIndex, itemIndex, event)}>
                {originalRender(props)}
              </View>
            );
          }}
        />
      </View>
    );
  });

SectionList.displayName = 'SectionList';

export default SectionList;
