import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { faker } from '@faker-js/faker';
import SectionList, { SectionListWithTabsRef } from '../../src/SectionList';

interface Section<T = any> {
  title: string;
  data: T[];
}

// Generate fake data for different categories
const generateFakeData = () => {
  const sections = [
    {
      title: 'People',
      data: Array.from({ length: 15 }, (_, index) => ({
        id: `person-${index}`,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatar: faker.image.avatar(),
        job: faker.person.jobTitle()
      }))
    },
    {
      title: 'Products',
      data: Array.from({ length: 20 }, (_, index) => ({
        id: `product-${index}`,
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        description: faker.commerce.productDescription(),
        category: faker.commerce.department()
      }))
    },
    {
      title: 'Companies',
      data: Array.from({ length: 12 }, (_, index) => ({
        id: `company-${index}`,
        name: faker.company.name(),
        catchPhrase: faker.company.catchPhrase(),
        industry: faker.company.buzzPhrase(),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}`
      }))
    },
    {
      title: 'Posts',
      data: Array.from({ length: 25 }, (_, index) => ({
        id: `post-${index}`,
        title: faker.lorem.sentence(),
        body: faker.lorem.paragraphs(2),
        author: faker.person.fullName(),
        date: faker.date.recent().toLocaleDateString()
      }))
    },
    {
      title: 'Books',
      data: Array.from({ length: 18 }, (_, index) => ({
        id: `book-${index}`,
        title: faker.lorem.words(3),
        author: faker.person.fullName(),
        genre: faker.helpers.arrayElement([
          'Fiction',
          'Mystery',
          'Romance',
          'Sci-Fi',
          'Biography'
        ]),
        pages: faker.number.int({ min: 200, max: 800 }),
        rating: faker.number
          .float({ min: 3, max: 5, multipleOf: 0.1 })
          .toFixed(1)
      }))
    },
    {
      title: 'Movies',
      data: Array.from({ length: 22 }, (_, index) => ({
        id: `movie-${index}`,
        title: faker.lorem.words(2),
        director: faker.person.fullName(),
        genre: faker.helpers.arrayElement([
          'Action',
          'Comedy',
          'Drama',
          'Horror',
          'Romance',
          'Thriller'
        ]),
        year: faker.date
          .between({ from: '1990-01-01', to: '2024-01-01' })
          .getFullYear(),
        rating: faker.number
          .float({ min: 6, max: 10, multipleOf: 0.1 })
          .toFixed(1)
      }))
    },
    {
      title: 'Restaurants',
      data: Array.from({ length: 16 }, (_, index) => ({
        id: `restaurant-${index}`,
        name: `${faker.lorem.word()} ${faker.helpers.arrayElement([
          'Bistro',
          'Cafe',
          'Grill',
          'Kitchen',
          'House'
        ])}`,
        cuisine: faker.helpers.arrayElement([
          'Italian',
          'Mexican',
          'Chinese',
          'Indian',
          'French',
          'Japanese'
        ]),
        rating: faker.number
          .float({ min: 3.5, max: 5, multipleOf: 0.1 })
          .toFixed(1),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
        priceRange: faker.helpers.arrayElement(['$', '$$', '$$$', '$$$$'])
      }))
    },
    {
      title: 'Events',
      data: Array.from({ length: 14 }, (_, index) => ({
        id: `event-${index}`,
        name: faker.lorem.words(3),
        type: faker.helpers.arrayElement([
          'Conference',
          'Workshop',
          'Concert',
          'Festival',
          'Meetup',
          'Seminar'
        ]),
        date: faker.date.future().toLocaleDateString(),
        location: faker.location.city(),
        attendees: faker.number.int({ min: 10, max: 500 })
      }))
    },
    {
      title: 'Locations',
      data: Array.from({ length: 19 }, (_, index) => ({
        id: `location-${index}`,
        name: faker.location.city(),
        country: faker.location.country(),
        population: faker.number
          .int({ min: 10000, max: 5000000 })
          .toLocaleString(),
        climate: faker.helpers.arrayElement([
          'Tropical',
          'Temperate',
          'Arid',
          'Continental',
          'Mediterranean'
        ]),
        attraction: faker.lorem.words(2)
      }))
    },
    {
      title: 'Tasks',
      data: Array.from({ length: 21 }, (_, index) => ({
        id: `task-${index}`,
        title: faker.lorem.sentence(4),
        priority: faker.helpers.arrayElement(['High', 'Medium', 'Low']),
        status: faker.helpers.arrayElement([
          'Todo',
          'In Progress',
          'Done',
          'Blocked'
        ]),
        assignee: faker.person.fullName(),
        dueDate: faker.date.future().toLocaleDateString()
      }))
    },
    {
      title: 'Messages',
      data: Array.from({ length: 17 }, (_, index) => ({
        id: `message-${index}`,
        sender: faker.person.fullName(),
        subject: faker.lorem.words(5),
        preview: faker.lorem.sentence(),
        timestamp: faker.date.recent().toLocaleTimeString(),
        unread: faker.datatype.boolean()
      }))
    }
  ];
  return sections;
};

function HomeScreen() {
  const [sections, setSections] = React.useState<any[]>(generateFakeData());

  const sectionListRef = React.useRef<SectionListWithTabsRef>(null);

  // Scroll to random tab when screen opens
  React.useEffect(() => {
    if (sectionListRef.current) {
      const randomIndex = Math.floor(Math.random() * sections.length + 1);
      sectionListRef.current.scrollToSection(randomIndex);
    }
  }, [sections.length]);

  const renderTab = (
    section: Section & { isActive?: boolean; index?: number }
  ) => (
    <View style={[styles.tab, section.isActive && styles.activeTab]}>
      <Text style={[styles.tabText, section.isActive && styles.activeTabText]}>
        {section.title}
      </Text>
      <Text
        style={[styles.tabCount, section.isActive && styles.activeTabCount]}
      >
        ({section.data.length})
      </Text>
    </View>
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
      <Text style={styles.sectionHeaderCount}>{section.data.length} items</Text>
    </View>
  );

  const renderItem = ({ item, section }: { item: any; section: Section }) => {
    switch (section.title) {
      case 'People':
        return (
          <TouchableOpacity style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemSubtitle}>{item.job}</Text>
            </View>
            <Text style={styles.itemDetail}>{item.email}</Text>
          </TouchableOpacity>
        );

      case 'Products':
        return (
          <TouchableOpacity style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemPrice}>${item.price}</Text>
            </View>
            <Text style={styles.itemSubtitle}>{item.category}</Text>
            <Text style={styles.itemDetail} numberOfLines={2}>
              {item.description}
            </Text>
          </TouchableOpacity>
        );

      case 'Companies':
        return (
          <TouchableOpacity style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item.name}</Text>
            </View>
            <Text style={styles.itemSubtitle}>{item.catchPhrase}</Text>
            <Text style={styles.itemDetail}>{item.address}</Text>
          </TouchableOpacity>
        );

      case 'Posts':
        return (
          <TouchableOpacity style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.itemDate}>{item.date}</Text>
            </View>
            <Text style={styles.itemSubtitle}>By {item.author}</Text>
            <Text style={styles.itemDetail} numberOfLines={3}>
              {item.body}
            </Text>
          </TouchableOpacity>
        );

      case 'Books':
        return (
          <TouchableOpacity style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.itemRating}>⭐ {item.rating}</Text>
            </View>
            <Text style={styles.itemSubtitle}>By {item.author}</Text>
            <View style={styles.itemDetailsRow}>
              <Text style={styles.itemGenre}>{item.genre}</Text>
              <Text style={styles.itemDetail}>{item.pages} pages</Text>
            </View>
          </TouchableOpacity>
        );

      case 'Movies':
        return (
          <TouchableOpacity style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.itemYear}>{item.year}</Text>
            </View>
            <Text style={styles.itemSubtitle}>Directed by {item.director}</Text>
            <View style={styles.itemDetailsRow}>
              <Text style={styles.itemGenre}>{item.genre}</Text>
              <Text style={styles.itemRating}>⭐ {item.rating}/10</Text>
            </View>
          </TouchableOpacity>
        );

      case 'Restaurants':
        return (
          <TouchableOpacity style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemPriceRange}>{item.priceRange}</Text>
            </View>
            <View style={styles.itemDetailsRow}>
              <Text style={styles.itemGenre}>{item.cuisine}</Text>
              <Text style={styles.itemRating}>⭐ {item.rating}</Text>
            </View>
            <Text style={styles.itemDetail} numberOfLines={1}>
              {item.address}
            </Text>
          </TouchableOpacity>
        );

      case 'Events':
        return (
          <TouchableOpacity style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemEventType}>{item.type}</Text>
            </View>
            <Text style={styles.itemSubtitle}>
              {item.location} • {item.date}
            </Text>
            <Text style={styles.itemDetail}>{item.attendees} attendees</Text>
          </TouchableOpacity>
        );

      case 'Locations':
        return (
          <TouchableOpacity style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemClimate}>{item.climate}</Text>
            </View>
            <Text style={styles.itemSubtitle}>{item.country}</Text>
            <View style={styles.itemDetailsRow}>
              <Text style={styles.itemDetail}>Pop: {item.population}</Text>
              <Text style={styles.itemAttraction}>{item.attraction}</Text>
            </View>
          </TouchableOpacity>
        );

      case 'Tasks':
        return (
          <TouchableOpacity style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text
                style={[
                  styles.itemPriority,
                  {
                    color:
                      item.priority === 'High'
                        ? '#ff4444'
                        : item.priority === 'Medium'
                        ? '#ffaa00'
                        : '#00aa00'
                  }
                ]}
              >
                {item.priority}
              </Text>
            </View>
            <View style={styles.itemDetailsRow}>
              <Text style={styles.itemStatus}>{item.status}</Text>
              <Text style={styles.itemDetail}>Due: {item.dueDate}</Text>
            </View>
            <Text style={styles.itemSubtitle}>Assigned to {item.assignee}</Text>
          </TouchableOpacity>
        );

      case 'Messages':
        return (
          <TouchableOpacity
            style={[styles.itemContainer, item.unread && styles.unreadMessage]}
          >
            <View style={styles.itemHeader}>
              <Text
                style={[styles.itemTitle, item.unread && styles.unreadText]}
                numberOfLines={1}
              >
                {item.subject}
              </Text>
              <Text style={styles.itemTimestamp}>{item.timestamp}</Text>
            </View>
            <Text
              style={[styles.itemSubtitle, item.unread && styles.unreadText]}
            >
              From: {item.sender}
            </Text>
            <Text style={styles.itemDetail} numberOfLines={1}>
              {item.preview}
            </Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <SectionList
        ref={sectionListRef}
        sections={sections}
        renderTab={renderTab}
        renderItem={renderItem}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={renderSectionHeader}
        tabBarStyle={styles.tabBar}
        keyExtractor={(item: any) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  tabBar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 8
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 4
  },
  activeTab: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginRight: 4
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  tabCount: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400'
  },
  activeTabCount: {
    color: '#E3F2FD',
    fontWeight: '500'
  },
  sectionHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333'
  },
  sectionHeaderCount: {
    fontSize: 14,
    color: '#666666'
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 8
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4
  },
  itemDetail: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 20
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  itemDate: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500'
  },
  itemDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  itemGenre: {
    fontSize: 12,
    color: '#666666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: '500'
  },
  itemRating: {
    fontSize: 12,
    color: '#ff8c00',
    fontWeight: '600'
  },
  itemYear: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500'
  },
  itemPriceRange: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold'
  },
  itemEventType: {
    fontSize: 12,
    color: '#ffffff',
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: '500'
  },
  itemClimate: {
    fontSize: 12,
    color: '#666666',
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: '500'
  },
  itemAttraction: {
    fontSize: 12,
    color: '#888888',
    fontStyle: 'italic'
  },
  itemPriority: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#f8f8f8'
  },
  itemStatus: {
    fontSize: 12,
    color: '#666666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: '500'
  },
  itemTimestamp: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '400'
  },
  unreadMessage: {
    backgroundColor: '#f8f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF'
  },
  unreadText: {
    fontWeight: '600',
    color: '#000000'
  }
});

export default HomeScreen;
