import {
  Dimensions,
  PixelRatio,
  Platform,
  type ScaledSize,
} from 'react-native';
import { useCallback, useEffect, useState } from 'react';

/**
 * Responsive-csx - A comprehensive responsive scaling system
 * This library provides a simple yet powerful API for creating responsive layouts
 * that scale appropriately across different device sizes and orientations.
 */

// ------------- DEVICE DETECTION -------------

class DeviceDetectionService {
  width: number;
  height: number;
  screenWidth: number;
  screenHeight: number;
  pixelDensity: number;
  fontScale: number;

  isPhone!: boolean;
  isTablet!: boolean;
  isSmallPhone!: boolean;
  isLargePhone!: boolean;
  isSmallTablet!: boolean;
  isLargeTablet!: boolean;

  isIOS: boolean;
  isAndroid: boolean;
  isIPhoneX!: boolean;
  hasNotch!: boolean;

  aspectRatio!: number;
  diagonalInches!: number;

  baseUnit!: number;

  constructor() {
    const window = Dimensions.get('window');
    const screen = Dimensions.get('screen');

    this.width = window.width;
    this.height = window.height;
    this.screenWidth = screen.width;
    this.screenHeight = screen.height;
    this.pixelDensity = PixelRatio.get();
    this.fontScale = PixelRatio.getFontScale();

    this.isIOS = Platform.OS === 'ios';
    this.isAndroid = Platform.OS === 'android';

    this.updateMetrics(window, screen);
  }

  updateMetrics(window?: ScaledSize, screen?: ScaledSize): void {
    if (window) {
      this.width = window.width;
      this.height = window.height;
    }

    if (screen) {
      this.screenWidth = screen.width;
      this.screenHeight = screen.height;
    }

    this.pixelDensity = PixelRatio.get();
    this.fontScale = PixelRatio.getFontScale();

    this.aspectRatio =
      Math.max(this.width, this.height) / Math.min(this.width, this.height);

    const widthInches = this.width / (this.pixelDensity * 160);
    const heightInches = this.height / (this.pixelDensity * 160);
    this.diagonalInches = Math.sqrt(
      Math.pow(widthInches, 2) + Math.pow(heightInches, 2)
    );

    this.isTablet =
      this.diagonalInches >= 7 || (this.width > 550 && this.aspectRatio < 1.8);
    this.isPhone = !this.isTablet;

    this.isSmallPhone = this.isPhone && this.diagonalInches < 5;
    this.isLargePhone = this.isPhone && this.diagonalInches > 6;
    this.isSmallTablet = this.isTablet && this.diagonalInches < 8.5;
    this.isLargeTablet = this.isTablet && this.diagonalInches > 10;

    this.isIPhoneX =
      this.isIOS &&
      !this.isTablet &&
      !Platform.isTV &&
      (this.height === 812 ||
        this.width === 812 ||
        this.height === 896 ||
        this.width === 896 ||
        this.height === 844 ||
        this.width === 844 ||
        this.height === 926 ||
        this.width === 926);

    this.hasNotch = this.isIPhoneX || (this.isAndroid && this.aspectRatio > 2);

    const widthBaseUnit = this.width / (this.isTablet ? 768 : 375);
    const heightBaseUnit = this.height / (this.isTablet ? 1024 : 812);

    this.baseUnit = widthBaseUnit * 0.6 + heightBaseUnit * 0.4;
    this.baseUnit = Math.min(Math.max(this.baseUnit, 0.75), 1.5);
  }

  get isLandscape(): boolean {
    return this.width > this.height;
  }

  get isPortrait(): boolean {
    return this.height >= this.width;
  }

  getBaseSize(): number {
    if (this.isLargeTablet) return 10;
    if (this.isTablet) return 8;
    if (this.isLargePhone) return 7;
    if (this.isSmallPhone) return 5;
    return 6;
  }
}

export const Device = new DeviceDetectionService();

// ------------- SCALING UTILITIES -------------

/**
 * Scales a size based on the screen dimensions with width priority
 * Good for horizontal measurements and general sizing
 * @param size The size to scale
 * @returns The scaled size
 */
export function scale(size: number): number {
  return Math.round(size * Device.baseUnit * 10) / 10;
}

/**
 * Scales a size with height bias for vertical measurements
 * Good for heights, vertical margins, etc.
 * @param size The size to scale vertically
 * @returns The vertically scaled size
 */
export function verticalScale(size: number): number {
  const heightRatio = Device.height / (Device.isTablet ? 1024 : 812);
  return Math.round(size * heightRatio * 10) / 10;
}

/**
 * Moderately scales a size with a mix of width and height factors
 * Good for elements that need balanced scaling
 * @param size The size to scale
 * @param factor How much to weigh width vs height (0-1, default 0.5)
 * @returns The moderately scaled size
 */
export function moderateScale(size: number, factor: number = 0.5): number {
  const widthFactor = Device.width / (Device.isTablet ? 768 : 375);
  const heightFactor = Device.height / (Device.isTablet ? 1024 : 812);
  const scaleFactor = widthFactor * (1 - factor) + heightFactor * factor;
  return Math.round(size * scaleFactor * 10) / 10;
}

/**
 * Scales a font size with additional adjustments for device type
 * Applies special handling for readability across different devices
 * @param size The font size to scale
 * @returns The scaled font size
 */
export function scaleFontSize(size: number): number {
  let adjustedSize = size;

  if (Device.isSmallPhone) adjustedSize *= 0.9;
  if (Device.isTablet) adjustedSize *= Device.isLargeTablet ? 1.15 : 1.05;
  if (Device.isLargePhone) adjustedSize *= 1.05;

  const widthRatio = Device.width / (Device.isTablet ? 768 : 375);
  const heightRatio = Device.height / (Device.isTablet ? 1024 : 812);
  const fontRatio = widthRatio * 0.65 + heightRatio * 0.35;

  const accessibilityScale = Math.sqrt(Device.fontScale);

  const result =
    Math.round(adjustedSize * fontRatio * accessibilityScale * 10) / 10;

  const minSize = size * 0.7;
  const maxSize = size * 1.6;

  return Math.min(Math.max(result, minSize), maxSize);
}

// ------------- DIMENSION CHANGE DETECTION -------------

/**
 * React hook to handle dimension changes
 * @returns Current window dimensions and orientation
 */
export function useResponsiveDimensions() {
  const [dimensions, setDimensions] = useState({
    window: Dimensions.get('window'),
    screen: Dimensions.get('screen'),
    isLandscape: Device.isLandscape,
    isPortrait: Device.isPortrait,
  });

  const onChange = useCallback(() => {
    const window = Dimensions.get('window');
    const screen = Dimensions.get('screen');

    // Update device metrics
    Device.updateMetrics(window, screen);

    setDimensions({
      window,
      screen,
      isLandscape: Device.isLandscape,
      isPortrait: Device.isPortrait,
    });
  }, []);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', onChange);

    return () => {
      // Clean up event listener
      subscription.remove();
    };
  }, [onChange]);

  return dimensions;
}

/**
 * Responsive scaling utilities and device/context info for consistent UI design
 */
export const rs = {
  // Scaling functions
  s: scale, // Width-based scale (e.g., padding, margin, radius)
  vs: verticalScale, // Height-based scale (e.g., vertical spacing)
  ms: moderateScale, // Moderated scale based on width with optional factor
  fs: scaleFontSize, // Font scaling based on screen size & pixel ratio

  // Device detection instance
  device: Device, // Provides info like isTablet, hasNotch, baseUnit, etc.

  // Hook for listening to dimension/orientation changes in real-time
  useDimensions: useResponsiveDimensions, // Returns window/screen + orientation
};
