![responsive-csx](https://github.com/user-attachments/assets/304eb6c9-c018-437e-96d4-26cd23ce7749)

# responsive-csx

A comprehensive responsive scaling system for React Native apps that adapts to different device sizes, orientations, and accessibility settings.

## Installation

```bash
npm install responsive-csx


yarn add responsive-csx


pnpm add responsive-csx
```

## Features

✅ **Device Detection** - Automatically identifies device types and characteristics  
✅ **Dynamic Scaling** - Adapts to dimension changes and orientation shifts  
✅ **Accessibility Support** - Respects system font scaling preferences  
✅ **Multi-form Factor** - Specialized handling for phones, tablets of different sizes  
✅ **Notch Detection** - Accounts for devices with display cutouts  
✅ **Orientation Awareness** - Optimizes layouts for portrait and landscape modes

## Basic Usage

```javascript
import {
  scale,
  verticalScale,
  moderateScale,
  scaleFontSize,
} from 'responsive-csx';

const styles = StyleSheet.create({
  container: {
    width: scale(300),
    height: verticalScale(200),
    padding: moderateScale(15),
  },
  text: {
    fontSize: scaleFontSize(16),
  },
});
```

## API Reference

### Scaling Functions

#### `scale(size: number): number`

Scales a size based primarily on screen width. Ideal for horizontal measurements like widths, horizontal margins/padding, and general component sizing.

```javascript
width: scale(100); // Will adapt to screen width proportionally
```

#### `verticalScale(size: number): number`

Scales a size with height bias. Best for vertical measurements like heights, vertical margins/padding, and component heights.

```javascript
marginTop: verticalScale(20); // Will scale based on screen height
```

#### `moderateScale(size: number, factor: number = 0.5): number`

Provides balanced scaling with adjustable weight between width and height. Perfect for elements that need more nuanced scaling like borders, shadows, or balanced components.

```javascript
borderRadius: moderateScale(10, 0.3); // Will scale with 70% width influence, 30% height
```

#### `scaleFontSize(size: number): number`

Specially designed for font scaling with additional adjustments for readability and device type. Incorporates the system's accessibility font scale settings.

```javascript
fontSize: scaleFontSize(16); // Will adapt for readability across devices and respect accessibility settings
```

### Device Information

The `Device` object provides detailed information about the current device:

```javascript
import { Device } from 'responsive-csx';

console.log(Device.isTablet); // Is this a tablet?
console.log(Device.isLandscape); // Is the device in landscape orientation?
console.log(Device.hasNotch); // Does the device have a notch?
```

Properties include:

- `width`, `height` - Current window dimensions
- `isPhone`, `isTablet` - Device type
- `isSmallPhone`, `isLargePhone`, `isSmallTablet`, `isLargeTablet` - Specific device size categories
- `isLandscape`, `isPortrait` - Current orientation
- `isIOS`, `isAndroid` - Platform detection
- `hasNotch` - Whether the device has a display cutout
- `pixelDensity` - The device's pixel density
- `fontScale` - System font scale setting

### Dimension Change Handling

Use the `useResponsiveDimensions` hook to react to changes in screen dimensions and orientation:

```javascript
import { useResponsiveDimensions } from 'responsive-csx';

function MyComponent() {
  const { window, screen, isLandscape, isPortrait } = useResponsiveDimensions();

  // Component will re-render when dimensions change
  return (
    <View
      style={isLandscape ? styles.landscapeContainer : styles.portraitContainer}
    >
      {/* Your responsive component content */}
    </View>
  );
}
```

## Best Practices

### When to Use Each Scaling Function

- **`scale`** - Use for most UI elements where width consistency is important
- **`verticalScale`** - Use for elements that should scale with screen height
- **`moderateScale`** - Use for elements that need balanced scaling (adjust factor as needed)
- **`scaleFontSize`** - Always use for text elements instead of regular scale functions

### Component Design

1. **Create device-specific adjustments** using the Device object:

   ```javascript
   paddingTop: Device.hasNotch ? scale(40) : scale(20);
   ```

2. **Combine with flexbox** for the most flexible layouts:

   ```javascript
   container: {
     flex: 1,
     padding: scale(16),
   }
   ```

3. **Handle orientation changes** with the useResponsiveDimensions hook:
   ```javascript
   const { isLandscape } = useResponsiveDimensions();
   // Apply different styles based on orientation
   ```

### Performance Considerations

- Call scaling functions during style definition, not within render methods
- For frequently changing components, consider memoizing scaled values

## Example App Structure

```javascript
// Theme.js - Create a centralized theme with scaled values
import { scale, scaleFontSize } from 'responsive-csx';

export const Theme = {
  spacing: {
    xs: scale(4),
    sm: scale(8),
    md: scale(16),
    lg: scale(24),
    xl: scale(32),
  },
  typography: {
    h1: scaleFontSize(24),
    h2: scaleFontSize(20),
    body: scaleFontSize(16),
    caption: scaleFontSize(14),
  },
  // other theme values
};

// Use in components
import { Theme } from './Theme';

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.typography.h1,
  },
});
```

## License

[MIT](LICENSE)
