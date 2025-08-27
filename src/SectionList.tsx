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

// Declare global functions for TypeScript
declare const setTimeout: (callback: (...args: any[]) => void, delay?: number) => number;
declare const clearTimeout: (id: number) => void;
declare const console: {
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
};

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
  renderItem?: (info: { item: any; index: number; section: SectionListData<any>; separators: any }) => React.ReactNode;
  renderSectionHeader?: (info: { section: SectionListData<any> }) => React.ReactNode;
  keyExtractor?: (item: any, index: number) => string;
  showsVerticalScrollIndicator?: boolean;
}

export interface SectionListWithTabsRef {
  sectionList: SectionListRef;
  tabBar: TabBarRef;
  scrollToSection: (index: number, retryOptions?: { maxRetries?: number; timeoutMs?: number; retryDelayMs?: number }) => void;
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
  const pendingScrollQueueRef = React.useRef<number[]>([]);
  const measurementsCountRef = React.useRef<{ headers: number; items: number }>({ headers: 0, items: 0 });
  const measuredItemsRef = React.useRef<Set<string>>(new Set());



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
      console.log('calculateSectionPositions called, sectionsReady:', sectionsReady);
      // Debounce calculations to avoid excessive updates during rapid layout changes
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        // Check if all measurements are complete
        const totalSections = sections.length;
        const totalItems = sections.reduce((sum, section) => sum + section.data.length, 0);
        const { headers, items } = measurementsCountRef.current;

        console.log(`Measurements status: ${headers}/${totalSections} headers, ${items}/${totalItems} items`);

        // Check if all sections have both header measurements and complete item measurements
        let allMeasurementsComplete = true;
        let hasAnyMeasurements = false;

        for (let i = 0; i < totalSections; i++) {
          const measurements = sectionMeasurementsRef.current[i];
          if (measurements) {
            hasAnyMeasurements = true;
            // Check if header is measured and all items in this section are measured
            if (measurements.headerHeight <= 0 || measurements.itemHeights.length !== sections[i].data.length) {
              allMeasurementsComplete = false;
              break;
            }
          } else {
            allMeasurementsComplete = false;
            break;
          }
        }

        // If we don't have any measurements yet, don't consider it complete
        if (!hasAnyMeasurements) {
          allMeasurementsComplete = false;
        }

        // Only proceed if we have some measurements to work with
        if (!sectionsReady && hasAnyMeasurements) {
          const positions: { [key: number]: number } = {};
          let cumulativeHeight = 0;
          let hasAllMeasurements = true;

          sections.forEach((section, index) => {
            positions[index] = cumulativeHeight;

            const measurements = sectionMeasurementsRef.current[index];
            if (measurements && measurements.headerHeight > 0 && measurements.itemHeights.length === section.data.length) {
              // Use actual measured heights
              const sectionHeaderHeight = measurements.headerHeight;
              const totalItemsHeight = measurements.itemHeights.reduce((sum, height) => {
                // Add item height plus margin (assuming 8px margin as before)
                return sum + height + 8;
              }, 0);

              cumulativeHeight += sectionHeaderHeight + totalItemsHeight;
            } else {
              // Fallback to estimated heights if measurements aren't complete
              hasAllMeasurements = false;
              const sectionHeaderHeight = 60;
              const estimatedItemHeight = 100; // Default estimate
              const totalItemsHeight = section.data.length * (estimatedItemHeight + 8);
              cumulativeHeight += sectionHeaderHeight + totalItemsHeight;
            }
          });

          sectionPositionsRef.current = positions;

          // Only set ready if we have all measurements
          if (allMeasurementsComplete && hasAllMeasurements) {
            setSectionsReady(true);
            console.log(`All sections are now ready! Positions calculated:`, positions);

            // Call the callback to notify that sections are ready
            if (onSectionsReady) {
              onSectionsReady();
            }
          } else {
            console.log(`Sections partially calculated (using estimates), will recalculate when all measurements complete`);
          }
        }

        // Execute pending scrolls for sections that now have measurements
        if (pendingScrollQueueRef.current.length > 0) {
          const sectionList = sectionListRef.current;
          if (sectionList) {
            // Filter to only sections that now have measurements
            const readyForScroll = pendingScrollQueueRef.current.filter((pendingIndex) => {
              const measurements = sectionMeasurementsRef.current[pendingIndex];
              return measurements && measurements.headerHeight > 0;
            });

            if (readyForScroll.length > 0) {
              console.log(`Processing ${readyForScroll.length} pending scrolls that now have measurements`);

              readyForScroll.forEach((pendingIndex) => {
                console.log(`Executing pending scroll for index: ${pendingIndex}`);

                let targetY = sectionPositionsRef.current[pendingIndex] || 0;
                console.log(`Pending scroll - targetY before header adjustment: ${targetY}`);

                // Adjust to show the first item instead of the header
                const measurements = sectionMeasurementsRef.current[pendingIndex];
                if (measurements && measurements.headerHeight > 0) {
                  targetY += measurements.headerHeight;
                  console.log(`Pending scroll - added actual header height: ${measurements.headerHeight}, final targetY: ${targetY}`);
                }

                const scrollResponder = sectionList.getScrollResponder?.();
                if (scrollResponder && scrollResponder.scrollTo) {
                  console.log(`Executing pending scroll to position: ${targetY}`);
                  scrollResponder.scrollTo({
                    x: 0,
                    y: targetY,
                    animated: true,
                  });
                }
              });

              // Remove processed scrolls from queue
              pendingScrollQueueRef.current = pendingScrollQueueRef.current.filter(
                index => !readyForScroll.includes(index)
              );

              console.log(`Remaining pending scrolls: ${pendingScrollQueueRef.current.length}`);
            }
          }
        }
      }, 100); // 100ms debounce - increased to allow more measurements to complete
    }, [sections, onSectionsReady]);

    // Reset measurements when sections change
    React.useEffect(() => {
      measurementsCountRef.current = { headers: 0, items: 0 };
      setSectionsReady(false);
      sectionMeasurementsRef.current = {};
      sectionPositionsRef.current = {};
      measuredItemsRef.current.clear();
      pendingScrollQueueRef.current = []; // Clear pending scrolls when sections change
      console.log('Sections changed, resetting measurements');
    }, [sections]);

    // Calculate positions when sections change or component mounts
    React.useEffect(() => {
      console.log('useEffect triggered: sections changed or component mounted');
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

      // Track measurement count
      measurementsCountRef.current.headers = Math.max(measurementsCountRef.current.headers, sectionIndex + 1);

      // Trigger position recalculation
      calculateSectionPositions();
    }, [calculateSectionPositions]);

    const handleItemLayout = React.useCallback((sectionIndex: number, itemIndex: number, event: { nativeEvent: { layout: { height: number } } }) => {
      const { height } = event.nativeEvent.layout;
      const itemKey = `${sectionIndex}-${itemIndex}`;

      // Only count this measurement if we haven't measured this item before
      if (!measuredItemsRef.current.has(itemKey)) {
        measuredItemsRef.current.add(itemKey);
        measurementsCountRef.current.items += 1;
      }

      const currentMeasurements = sectionMeasurementsRef.current[sectionIndex] || { headerHeight: 0, itemHeights: [] };
      currentMeasurements.itemHeights[itemIndex] = height;
      sectionMeasurementsRef.current[sectionIndex] = currentMeasurements;

      // Trigger position recalculation
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
      scrollToSection: (index: number, retryOptions?: { maxRetries?: number; timeoutMs?: number; retryDelayMs?: number }) => {
        const {
          maxRetries = index + 1,
          timeoutMs = 1000,
          retryDelayMs = 50
        } = retryOptions || {};

        console.log(`scrollToSection called with index: ${index}, sectionsReady: ${sectionsReady}, retryOptions:`, retryOptions);

        const performScroll = (attemptCount = 0) => {
          const sectionList = sectionListRef.current;
          if (!sectionList) return;

          // Check if the target section has been measured
          const sectionMeasurements = sectionMeasurementsRef.current[index];
          const hasSectionMeasurements = sectionMeasurements && sectionMeasurements.headerHeight > 0;

          if (hasSectionMeasurements) {
            // Section has been measured, scroll to it immediately
            let targetY = sectionPositionsRef.current[index] || 0;
            console.log(`Section ${index} measured - targetY before header adjustment: ${targetY}`);

            // Adjust to show the first item instead of the header
            targetY += sectionMeasurements.headerHeight;
            console.log(`Added actual header height: ${sectionMeasurements.headerHeight}, final targetY: ${targetY}`);

            // Get the scroll responder and scroll directly
            const scrollResponder = sectionList.getScrollResponder?.();
            if (scrollResponder && scrollResponder.scrollTo) {
              console.log(`Scrolling to measured section position: ${targetY}`);
              scrollResponder.scrollTo({
                x: 0,
                y: targetY,
                animated: true,
              });
            }
          } else {
            // Section hasn't been measured yet, use estimated position
            console.log(`Section ${index} not measured (attempt ${attemptCount + 1}/${maxRetries + 1}), using estimated position`);

            // Calculate estimated position based on measured sections
            let estimatedY = 0;
            for (let i = 0; i < index; i++) {
              const measurements = sectionMeasurementsRef.current[i];
              if (measurements && measurements.headerHeight > 0 && measurements.itemHeights.length === sections[i].data.length) {
                // Use actual measurements for previous sections
                estimatedY += measurements.headerHeight;
                estimatedY += measurements.itemHeights.reduce((sum, height) => sum + height + 8, 0);
              } else {
                // Use estimates for unmeasured sections
                estimatedY += 60; // estimated header height
                estimatedY += sections[i].data.length * (100 + 8); // estimated item height + margin
              }
            }

            // Add estimated header height for target section
            estimatedY += 60;

            console.log(`Estimated position for section ${index}: ${estimatedY}`);

            // Scroll to estimated position
            const scrollResponder = sectionList.getScrollResponder?.();
            if (scrollResponder && scrollResponder.scrollTo) {
              console.log(`Scrolling to estimated position: ${estimatedY}`);
              scrollResponder.scrollTo({
                x: 0,
                y: estimatedY,
                animated: true,
              });
            }

            // Store for potential adjustment when more measurements come in
            if (!pendingScrollQueueRef.current.includes(index)) {
              pendingScrollQueueRef.current.push(index);
            }

            // Trigger position calculation to get more accurate measurements
            calculateSectionPositions();

            // If we haven't reached max retries and timeout hasn't expired, retry
            if (attemptCount < maxRetries) {
              const delay = retryDelayMs * Math.pow(2, attemptCount); // Exponential backoff
              console.log(`Scheduling retry ${attemptCount + 1} in ${delay}ms for section ${index}`);
              setTimeout(() => {
                performScroll(attemptCount + 1);
              }, delay);
            } else {
              console.log(`Max retries (${maxRetries}) reached for section ${index}, giving up`);
            }
          }
        };

        // Start the scroll attempt with timeout
        performScroll();

        // Set up a timeout to force final scroll attempt
        if (timeoutMs > 0) {
          setTimeout(() => {
            console.log(`Timeout reached (${timeoutMs}ms), forcing final scroll attempt for section ${index}`);
            performScroll(maxRetries);
          }, timeoutMs);
        }
      }
    }), [sections, calculateSectionPositions]);

    const handleTabPress = React.useCallback(
      (index: number) => {
        // Always update the current index immediately for visual feedback
        setCurrentIndex(index);
        blockUpdateIndexRef.current = true;

        // Use the same scrollToSection method with retry mechanism
        const scrollToSection = (index: number, retryOptions?: { maxRetries?: number; timeoutMs?: number; retryDelayMs?: number }) => {
          const {
            maxRetries = index + 1,
            timeoutMs = 1000,
            retryDelayMs = 50
          } = retryOptions || {};

          console.log(`Tab press scrollToSection called with index: ${index}, sectionsReady: ${sectionsReady}`);

          const performScroll = (attemptCount = 0) => {
            const sectionList = sectionListRef.current;
            if (!sectionList) return;

            // Check if the target section has been measured
            const sectionMeasurements = sectionMeasurementsRef.current[index];
            const hasSectionMeasurements = sectionMeasurements && sectionMeasurements.headerHeight > 0;

            if (hasSectionMeasurements) {
              // Section has been measured, scroll to it immediately
              let targetY = sectionPositionsRef.current[index] || 0;
              console.log(`Tab press - section ${index} measured, targetY before header adjustment: ${targetY}`);

              // Adjust to show the first item instead of the header
              targetY += sectionMeasurements.headerHeight;
              console.log(`Tab press - added actual header height: ${sectionMeasurements.headerHeight}, final targetY: ${targetY}`);

              // Get the scroll responder and scroll directly
              const scrollResponder = sectionList.getScrollResponder?.();
              if (scrollResponder && scrollResponder.scrollTo) {
                console.log(`Tab press - scrolling to measured position: ${targetY}`);
                scrollResponder.scrollTo({
                  x: 0,
                  y: targetY,
                  animated: true,
                });
              }
            } else {
              // Section hasn't been measured yet, use estimated position
              console.log(`Tab press - section ${index} not measured (attempt ${attemptCount + 1}/${maxRetries + 1}), using estimated position`);

              // Calculate estimated position based on measured sections
              let estimatedY = 0;
              for (let i = 0; i < index; i++) {
                const measurements = sectionMeasurementsRef.current[i];
                if (measurements && measurements.headerHeight > 0 && measurements.itemHeights.length === sections[i].data.length) {
                  // Use actual measurements for previous sections
                  estimatedY += measurements.headerHeight;
                  estimatedY += measurements.itemHeights.reduce((sum, height) => sum + height + 8, 0);
                } else {
                  // Use estimates for unmeasured sections
                  estimatedY += 60; // estimated header height
                  estimatedY += sections[i].data.length * (100 + 8); // estimated item height + margin
                }
              }

              // Add estimated header height for target section
              estimatedY += 60;

              console.log(`Tab press - estimated position for section ${index}: ${estimatedY}`);

              // Scroll to estimated position
              const scrollResponder = sectionList.getScrollResponder?.();
              if (scrollResponder && scrollResponder.scrollTo) {
                console.log(`Tab press - scrolling to estimated position: ${estimatedY}`);
                scrollResponder.scrollTo({
                  x: 0,
                  y: estimatedY,
                  animated: true,
                });
              }

              // Store for potential adjustment when more measurements come in
              if (!pendingScrollQueueRef.current.includes(index)) {
                pendingScrollQueueRef.current.push(index);
              }

              // Trigger position calculation to get more accurate measurements
              calculateSectionPositions();

              // If we haven't reached max retries and timeout hasn't expired, retry
              if (attemptCount < maxRetries) {
                const delay = retryDelayMs * Math.pow(2, attemptCount); // Exponential backoff
                console.log(`Tab press - scheduling retry ${attemptCount + 1} in ${delay}ms for section ${index}`);
                setTimeout(() => {
                  performScroll(attemptCount + 1);
                }, delay);
              } else {
                console.log(`Tab press - max retries (${maxRetries}) reached for section ${index}, giving up`);
              }
            }
          };

          // Start the scroll attempt with timeout
          performScroll();

          // Set up a timeout to force final scroll attempt
          if (timeoutMs > 0) {
            setTimeout(() => {
              console.log(`Tab press - timeout reached (${timeoutMs}ms), forcing final scroll attempt for section ${index}`);
              performScroll(maxRetries);
            }, timeoutMs);
          }
        };

        // Call scrollToSection with default retry options
        scrollToSection(index);
      },
      [sections, calculateSectionPositions]
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
        minimumViewTime: 100,
        itemVisiblePercentThreshold: 50,
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
          disabled={false}
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
