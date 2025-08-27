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

export interface SectionListRef {
  scrollToLocation: RNSectionList<any>['scrollToLocation'];
  scrollToEnd: RNSectionList<any>['scrollToEnd'];
  scrollToOffset: RNSectionList<any>['scrollToOffset'];
  scrollToIndex: RNSectionList<any>['scrollToIndex'];
  flashScrollIndicators: RNSectionList<any>['flashScrollIndicators'];
  getNativeScrollRef: RNSectionList<any>['getNativeScrollRef'];
  getScrollResponder: RNSectionList<any>['getScrollResponder'];
  getScrollableNode: RNSectionList<any>['getScrollableNode'];
}

interface IProps extends SectionListProps<any> {
  scrollToLocationOffset?: number;
  tabBarStyle?: ViewStyle | RegisteredStyle<ViewStyle>;
  renderTab: (section: SectionListData<any> & { isActive: boolean }) => React.ReactNode;
  sections: ReadonlyArray<SectionListData<any>>;
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
    scrollToLocationOffset: _scrollToLocationOffset,
    ...restProps
  }, ref) => {
      const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const blockUpdateIndexRef = React.useRef<boolean>(false);
    const sectionListRef = React.useRef<RNSectionList<any>>(null);
  const tabBarRef = React.useRef<TabBarRef>(null);
  
  // Track section positions dynamically
  const sectionPositionsRef = React.useRef<{ [key: number]: number }>({});
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

    // Calculate section positions based on content
    const calculateSectionPositions = React.useCallback(() => {
      const sectionList = sectionListRef.current;
      if (!sectionList) return;

      // Use a timeout to allow the list to render completely
      setTimeout(() => {
        const positions: { [key: number]: number } = {};
        let cumulativeHeight = 0;

        prepareSections.forEach((section, index) => {
          positions[index] = cumulativeHeight;
          
          // Estimate height based on section content
          // Section header height (approximate)
          const sectionHeaderHeight = 60;
          
          // Item height (approximate) - you can adjust these based on your content
          const itemHeight = section.title === 'People' ? 100 :
                            section.title === 'Products' ? 120 :
                            section.title === 'Companies' ? 110 :
                            section.title === 'Posts' ? 130 :
                            section.title === 'Books' ? 115 :
                            section.title === 'Movies' ? 125 :
                            section.title === 'Restaurants' ? 120 :
                            section.title === 'Events' ? 110 :
                            section.title === 'Locations' ? 125 :
                            section.title === 'Tasks' ? 135 :
                            section.title === 'Messages' ? 105 : 100;

          const totalItemsHeight = section.data.length * (itemHeight + 8); // 8px for margins
          
          cumulativeHeight += sectionHeaderHeight + totalItemsHeight;
        });

        sectionPositionsRef.current = positions;
        setSectionsReady(true);
        
        // Execute pending scroll if there is one
        if (pendingScrollIndexRef.current !== null) {
          const pendingIndex = pendingScrollIndexRef.current;
          pendingScrollIndexRef.current = null;
          
          // Execute the scroll with calculated positions
          const sectionList = sectionListRef.current;
          if (sectionList) {
            const targetY = positions[pendingIndex] || 0;
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
      }, 500); // Allow time for content to render
    }, [prepareSections]);

    // Calculate positions when sections change or component mounts
    React.useEffect(() => {
      calculateSectionPositions();
    }, [calculateSectionPositions]);

    React.useImperativeHandle(ref, () => ({
      sectionList: {
        scrollToLocation: (...args: any[]) => sectionListRef.current?.scrollToLocation(...args),
        scrollToEnd: (...args: any[]) => sectionListRef.current?.scrollToEnd(...args),
        scrollToOffset: (...args: any[]) => sectionListRef.current?.scrollToOffset(...args),
        scrollToIndex: (...args: any[]) => sectionListRef.current?.scrollToIndex(...args),
        flashScrollIndicators: () => sectionListRef.current?.flashScrollIndicators(),
        getNativeScrollRef: () => sectionListRef.current?.getNativeScrollRef(),
        getScrollResponder: () => sectionListRef.current?.getScrollResponder(),
        getScrollableNode: () => sectionListRef.current?.getScrollableNode(),
      },
      tabBar: {
        scrollTo: (...args: any[]) => tabBarRef.current?.scrollTo(...args),
        scrollToEnd: (...args: any[]) => tabBarRef.current?.scrollToEnd(...args),
        flashScrollIndicators: () => tabBarRef.current?.flashScrollIndicators(),
        getScrollResponder: () => tabBarRef.current?.getScrollResponder(),
        getScrollableNode: () => tabBarRef.current?.getScrollableNode(),
        getNativeScrollRef: () => tabBarRef.current?.getNativeScrollRef(),
      },
      scrollToSection: (index: number) => {
        const sectionList = sectionListRef.current;
        if (sectionList && sectionsReady) {
          // Use dynamically calculated positions
          const targetY = sectionPositionsRef.current[index] || 0;
          
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
          const targetY = sectionPositionsRef.current[index] || 0;
          
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
        />
      </View>
    );
  });

SectionList.displayName = 'SectionList';

export default SectionList;
