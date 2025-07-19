![responsive-csx](https://github.com/user-attachments/assets/304eb6c9-c018-437e-96d4-26cd23ce7749)

<table style="width: 100%; text-align: center; border-collapse: collapse; max-width: 500px; margin: 0 auto;">
  <thead>
    <tr>
      <th style="padding: 10px; border: 1px solid #ddd; font-size: 18px;">Device Preview</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">
        <img src="https://github.com/user-attachments/assets/ab06c7bb-4f3e-4727-8258-50a8b172efd6" alt="iPhone Screenshot" style="width: 100%; max-height: 200px; object-fit: contain;">
      </td>
    </tr>
  </tbody>
</table>





## ✨ Features

- 📏 Smart scaling: width, height, and font scaling tailored to device types
- 🔁 Live device orientation and dimension detection with a hook
- 🔍 Device awareness: phone/tablet detection, notch presence, aspect ratios
- ⚖️ Moderated scaling with factor customization
- 🧠 Intelligent font scaling with accessibility support
- ⚡ Minimal dependencies, plug-and-play setup

## 📦 Installation

```bash
npm install responsive-csx


yarn add responsive-csx


pnpm add responsive-csx
```

## 🔧 Usage

> The `rs` object provides quick access to commonly used utilities:

📏 Scaling functions:

| Function  | Description                               | Equivalent import |
| --------- | ----------------------------------------- | ----------------- |
| `rs.s()`  | Width-based scale (padding, margin, etc.) | `scale()`         |
| `rs.vs()` | Height-based scale (vertical spacing)     | `verticalScale()` |
| `rs.ms()` | Moderated scale with customizable factor  | `moderateScale()` |
| `rs.fs()` | Font scaling based on screen/pixel ratio  | `scaleFontSize()` |


```tsx
import { rs } from 'responsive-csx';

const styles = StyleSheet.create({
  container: {
    padding: rs.s(16),       // Width-based scaling
    marginVertical: rs.vs(8), // Height-based scaling
  },
  title: {
    fontSize: rs.fs(18),     // Font scaling
  },
});
```

🔒 Clamp Options

Each function supports optional clamp:
```tsx
rs.s(16, { min: 12 });           // Clamp only min
rs.s(16, { max: 20 });           // Clamp only max
rs.s(16, { min: 12, max: 20 });  // Clamp both ends

rs.fs(18, { min: 14 });          // Safe minimum font size
rs.ms(22, { max: 26 });          // Moderated with upper bound
```
✔️ You can pass clamp as the second parameter to restrict the result within a range:
```tsx
rs.s(value, {
  min?: number,
  max?: number,
});
```

📱 Device info:
```tsx
rs.device
```

| Property        | Description                      |
| --------------- | -------------------------------- |
| `screenWidth`   | Current screen width (dp)        |
| `screenHeight`  | Current screen height (dp)       |
| `isTablet`      | Whether the device is a tablet   |
| `aspectRatio`   | Screen aspect ratio              |
| `isSmallDevice` | Is width ≤ 360                   |
| `baseUnit`      | Internal base unit based on type |
| `deviceType`    | 'phone' \| 'tablet' \| 'unknown' |

```tsx
import { rs } from 'responsive-csx';

if (rs.device.isTablet) {
  console.log('Tablet detected!');
}
```

🔁 Hooks:

| Hook                 | Description                                             |
| -------------------- | ------------------------------------------------------- |
| `rs.useDimensions()` | React hook to get responsive dimensions and orientation |

```tsx
import { rs } from 'responsive-csx';

const ResponsiveComponent = () => {
  const { isLandscape, screenHeight } = rs.useDimensions();

  return (
    <View style={{ padding: rs.s(10) }}>
      <Text style={{ fontSize: rs.fs(16) }}>
        Orientation: {isLandscape ? 'Landscape' : 'Portrait'} – Height: {screenHeight}
      </Text>
    </View>
  );
};

```

## 🧪 Device Internals

Behind the scenes, we calculate:

- 📐 Aspect ratio
- 📏 Diagonal inches
- 📱 Type (small/large phone or tablet)
- 🎯 Base unit per device
- 📊 Pixel & font scaling


## 📜 License

MIT © KJ-GM


