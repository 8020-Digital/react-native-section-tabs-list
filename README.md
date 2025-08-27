# React Native Section Tabs List

[![npm version](https://badge.fury.io/js/react-native-section-tabs-list.svg)](https://badge.fury.io/js/react-native-section-tabs-list)
[![npm](https://img.shields.io/npm/v/react-native-section-tabs-list.svg)](https://www.npmjs.com/package/react-native-section-tabs-list)
[![npm](https://img.shields.io/npm/dt/react-native-section-tabs-list.svg)](https://www.npmjs.com/package/react-native-section-tabs-list)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A beautiful, performant React Native component that combines section lists with scrollable tabs. Perfect for creating organized content with smooth navigation between different categories.

> 📦 **Now available on npm!** Install with `npm install react-native-section-tabs-list`

<div align="center">

![Demo](demo.gif)

*Smooth scrolling between sections with dynamic tab highlighting*

### 🚀 [View on npm](https://www.npmjs.com/package/react-native-section-tabs-list) • 📋 [GitHub Repository](https://github.com/8020-Digital/react-native-section-tabs-list) • 📖 [Documentation](#-api-reference)

</div>

## ✨ Features

- **🎯 Smart Scrolling** - Dynamic height calculation based on actual content
- **📱 Responsive Tabs** - Horizontally scrollable tab bar with active states
- **⚡ High Performance** - Optimized for large datasets
- **🎨 Customizable** - Flexible styling and rendering options
- **🔧 Programmatic Control** - Full API for external scroll control
- **📐 Dynamic Positioning** - Automatic section height calculation
- **🎲 Random Navigation** - Built-in random section scrolling
- **♿ Accessible** - Full accessibility support

## 📦 Installation

```bash
npm install react-native-section-tabs-list
```

or with yarn:

```bash
yarn add react-native-section-tabs-list
```

## ⚡ Getting Started

1. **Install the package**:

   ```bash
   npm install react-native-section-tabs-list
   ```

2. **Import and use**:

   ```tsx
   import SectionList from 'react-native-section-tabs-list';
   ```

3. **That's it!** No linking or additional setup required for React Native 0.60+

## 🚀 Quick Start

```tsx
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import SectionList, { SectionListWithTabsRef } from 'react-native-section-tabs-list';

const MyComponent = () => {
  const sectionListRef = React.useRef<SectionListWithTabsRef>(null);

  const sections = [
    {
      title: 'People',
      data: [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      ],
    },
    {
      title: 'Products',
      data: [
        { id: '1', name: 'iPhone', price: '$999' },
        { id: '2', name: 'MacBook', price: '$1999' },
      ],
    },
  ];

  const renderTab = (section: any) => (
    <View style={{
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: section.isActive ? '#007AFF' : '#f0f0f0',
      borderRadius: 8,
      marginHorizontal: 4,
    }}>
      <Text style={{
        color: section.isActive ? '#fff' : '#333',
        fontWeight: '600',
      }}>
        {section.title} ({section.data.length})
      </Text>
    </View>
  );

  const renderItem = ({ item, section }: any) => (
    <TouchableOpacity style={{
      padding: 16,
      backgroundColor: '#fff',
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 8,
    }}>
      <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
      {item.email && <Text style={{ color: '#666' }}>{item.email}</Text>}
      {item.price && <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>{item.price}</Text>}
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: any) => (
    <View style={{
      padding: 16,
      backgroundColor: '#f8f8f8',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{section.title}</Text>
    </View>
  );

  return (
    <SectionList
      ref={sectionListRef}
      sections={sections}
      renderTab={renderTab}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item) => item.id}
      tabBarStyle={{ backgroundColor: '#fff', paddingVertical: 8 }}
    />
  );
};

export default MyComponent;
```

## 🎛️ API Reference

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `sections` | `ReadonlyArray<SectionListData<any>>` | ✅ | Array of section data |
| `renderTab` | `(section: SectionData & { isActive: boolean }) => React.ReactNode` | ✅ | Function to render tab items |
| `renderItem` | `(info: { item: any, section: any }) => React.ReactNode` | ✅ | Function to render list items |
| `renderSectionHeader` | `(info: { section: any }) => React.ReactNode` | ❌ | Function to render section headers |
| `tabBarStyle` | `ViewStyle` | ❌ | Style object for the tab bar container |
| `scrollToLocationOffset` | `number` | ❌ | Offset for scroll positioning (deprecated) |
| `keyExtractor` | `(item: any, index: number) => string` | ❌ | Function to extract unique keys |
| `...SectionListProps` | `SectionListProps` | ❌ | All standard SectionList props |

### Ref Methods

```tsx
interface SectionListWithTabsRef {
  sectionList: {
    scrollToLocation: (params: ScrollToLocationParamsType) => void;
    scrollToEnd: (params?: { animated?: boolean }) => void;
    scrollToOffset: (params: { offset: number; animated?: boolean }) => void;
    // ... other SectionList methods
  };
  tabBar: {
    scrollTo: (params: { x?: number; y?: number; animated?: boolean }) => void;
    scrollToEnd: (params?: { animated?: boolean }) => void;
    // ... other ScrollView methods
  };
  scrollToSection: (index: number) => void; // ✨ Custom method
}
```

## 🔧 Advanced Usage

### Programmatic Scrolling

```tsx
const sectionListRef = useRef<SectionListWithTabsRef>(null);

// Scroll to specific section by index
const scrollToSection = (index: number) => {
  sectionListRef.current?.scrollToSection(index);
};

// Scroll to random section
const scrollToRandom = () => {
  const randomIndex = Math.floor(Math.random() * sections.length);
  sectionListRef.current?.scrollToSection(randomIndex);
};

// Access native SectionList methods
const scrollToTop = () => {
  sectionListRef.current?.sectionList.scrollToOffset({ offset: 0, animated: true });
};
```

### Custom Tab Styling

```tsx
const renderTab = (section: any) => (
  <Pressable
    style={({ pressed }) => [
      {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: section.isActive ? '#007AFF' : '#f5f5f5',
        borderRadius: 25,
        marginHorizontal: 6,
        shadowColor: section.isActive ? '#007AFF' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: section.isActive ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: section.isActive ? 6 : 2,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      },
    ]}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{
        color: section.isActive ? '#fff' : '#333',
        fontWeight: section.isActive ? '700' : '600',
        fontSize: 16,
      }}>
        {section.title}
      </Text>
      <View style={{
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: section.isActive ? 'rgba(255,255,255,0.3)' : '#e0e0e0',
        borderRadius: 12,
      }}>
        <Text style={{
          fontSize: 12,
          color: section.isActive ? '#fff' : '#666',
          fontWeight: '500',
        }}>
          {section.data.length}
        </Text>
      </View>
    </View>
  </Pressable>
);
```

### Random Section on Load

```tsx
const MyComponent = () => {
  const sectionListRef = useRef<SectionListWithTabsRef>(null);

  useEffect(() => {
    // Scroll to random section when component mounts
    if (sectionListRef.current) {
      const randomIndex = Math.floor(Math.random() * sections.length);
      sectionListRef.current.scrollToSection(randomIndex);
    }
  }, []);

  return (
    <SectionList
      ref={sectionListRef}
      // ... other props
    />
  );
};
```

### Complex Data Structures

```tsx
const sections = [
  {
    title: 'Movies',
    data: [
      {
        id: 'movie1',
        title: 'The Matrix',
        director: 'Lana Wachowski',
        year: 1999,
        rating: 8.7,
        genre: 'Sci-Fi',
      },
      // ... more movies
    ],
  },
  {
    title: 'Books',
    data: [
      {
        id: 'book1',
        title: 'Dune',
        author: 'Frank Herbert',
        pages: 688,
        rating: 4.2,
        genre: 'Science Fiction',
      },
      // ... more books
    ],
  },
];

const renderItem = ({ item, section }) => {
  switch (section.title) {
    case 'Movies':
      return <MovieItem movie={item} />;
    case 'Books':
      return <BookItem book={item} />;
    default:
      return <DefaultItem item={item} />;
  }
};
```

## 🎨 Styling Examples

### Modern Tab Bar

```tsx
const tabBarStyle = {
  backgroundColor: '#ffffff',
  borderBottomWidth: 1,
  borderBottomColor: '#e5e5e5',
  paddingVertical: 12,
  paddingHorizontal: 8,
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
};
```

### Glass Effect Tabs

```tsx
const renderTab = (section: any) => (
  <View style={{
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: section.isActive 
      ? 'rgba(0, 122, 255, 0.15)' 
      : 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: section.isActive 
      ? 'rgba(0, 122, 255, 0.3)' 
      : 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 4,
  }}>
    <Text style={{
      color: section.isActive ? '#007AFF' : '#666',
      fontWeight: section.isActive ? '600' : '400',
    }}>
      {section.title}
    </Text>
  </View>
);
```

## 🔍 Performance Tips

1. **Use keyExtractor**: Always provide a unique key for each item
2. **Optimize renderItem**: Avoid heavy computations in render functions
3. **Memoize components**: Use `React.memo` for complex item components
4. **Limit initial sections**: Load additional sections on demand
5. **Image optimization**: Use optimized images and lazy loading

## 🐛 Troubleshooting

### Common Issues

**Tabs not scrolling to correct sections:**

- Ensure your data structure is consistent
- Check that `keyExtractor` returns unique keys
- Verify section data is not empty

**Performance issues with large lists:**

- Implement `getItemLayout` if item heights are consistent
- Use `removeClippedSubviews={true}` for very long lists
- Consider pagination for extremely large datasets

**Styling not applied:**

- Check that style objects are properly formatted
- Ensure no conflicting styles in parent components
- Verify React Native version compatibility

## 📱 Platform Support

- ✅ iOS 11.0+
- ✅ Android API level 21+
- ✅ React Native 0.60+
- ✅ Expo SDK 38+

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/8020-Digital/react-native-section-tabs-list/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/8020-Digital/react-native-section-tabs-list/discussions)
- **Questions**: [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native-section-tabs-list) with tag `react-native-section-tabs-list`

When reporting issues, please include:

- React Native version
- Package version
- Platform (iOS/Android)
- Code example that reproduces the issue

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## 📊 Package Statistics

<div align="center">

[![npm](https://img.shields.io/npm/v/react-native-section-tabs-list.svg?style=for-the-badge)](https://www.npmjs.com/package/react-native-section-tabs-list)
[![npm downloads](https://img.shields.io/npm/dm/react-native-section-tabs-list.svg?style=for-the-badge)](https://www.npmjs.com/package/react-native-section-tabs-list)
[![GitHub stars](https://img.shields.io/github/stars/8020-Digital/react-native-section-tabs-list.svg?style=for-the-badge)](https://github.com/8020-Digital/react-native-section-tabs-list)

</div>

## 📦 Package Information

- **Package Name**: [`react-native-section-tabs-list`](https://www.npmjs.com/package/react-native-section-tabs-list)
- **Version**: 0.0.1
- **Bundle Size**: ~4.0 MB (includes demo assets)
- **Dependencies**: None (peer dependencies: React Native >=0.60.0)
- **TypeScript**: Full TypeScript support with type definitions

## 📝 Release Notes

### v0.0.1 (Latest)

- 🎉 **Initial Release**
- ✨ **11 Section Types**: People, Products, Companies, Posts, Books, Movies, Restaurants, Events, Locations, Tasks, Messages
- 🎯 **Smart Scrolling**: Dynamic height calculation based on actual content
- 📱 **Responsive Tabs**: Horizontally scrollable tab bar with active states  
- ⚡ **High Performance**: Optimized for large datasets
- 🎲 **Random Navigation**: Built-in random section scrolling on mount
- 📐 **Dynamic Positioning**: Automatic section height calculation
- 🔧 **Programmatic Control**: Full API for external scroll control
- 🎨 **Beautiful Demo**: Includes comprehensive example with 11 content types

## 🙏 Acknowledgments

- Built with ❤️ for the React Native community
- Inspired by modern mobile UI patterns
- Thanks to all contributors and users

---

**Made with ❤️ by [Pedro Goiania](https://github.com/pedrogoiania)**

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-☕-orange)](https://buymeacoffee.com/pedrogoiania)

### 📢 Spread the Word

If you find this package useful, please:

- ⭐ Star the [GitHub repository](https://github.com/8020-Digital/react-native-section-tabs-list)
- 📦 Leave a review on [npm](https://www.npmjs.com/package/react-native-section-tabs-list)
- 🐦 Share it with the React Native community

### 🔮 What's Next?

We're continuously working to improve this package. Upcoming features:

- 🎨 More customization options for tab styles
- 📊 Built-in analytics and usage tracking
- 🎪 Additional animation effects
- 🔄 Pull-to-refresh functionality
- 📱 Better accessibility support

**Want to contribute?** Check out our [open issues](https://github.com/8020-Digital/react-native-section-tabs-list/issues) or suggest new features!
