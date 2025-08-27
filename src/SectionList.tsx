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
declare global {
  function setTimeout(callback: () => void, delay: number): number;
  function clearTimeout(id: number): void;
}

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
      // eslint-disable-next-line no-undef
      const timer = setTimeout(() => {
        const positions: { [key: number]: number } = {};
        let cumulativeHeight = 0;

        prepareSections.forEach((section, index) => {
          positions[index] = cumulativeHeight;
          
          // Estimate height based on section content
          // Section header height (approximate)
          const sectionHeaderHeight = 60;
          
          // Item height (approximate) - you can adjust these based on your content
          const sectionWithTitle = section as any;
          const itemHeight = sectionWithTitle.title === 'People' ? 100 :
                            sectionWithTitle.title === 'Products' ? 120 :
                            sectionWithTitle.title === 'Companies' ? 110 :
                            sectionWithTitle.title === 'Posts' ? 130 :
                            sectionWithTitle.title === 'Books' ? 115 :
                            sectionWithTitle.title === 'Movies' ? 125 :
                            sectionWithTitle.title === 'Restaurants' ? 120 :
                            sectionWithTitle.title === 'Events' ? 110 :
                            sectionWithTitle.title === 'Locations' ? 125 :
                            sectionWithTitle.title === 'Tasks' ? 135 :
                            sectionWithTitle.title === 'Messages' ? 105 : 100;

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
      
      // eslint-disable-next-line no-undef
      return () => clearTimeout(timer);
    }, [prepareSections]);

    // Calculate positions when sections change or component mounts
    React.useEffect(() => {
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
