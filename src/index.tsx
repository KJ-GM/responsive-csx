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

    // --- Device Type Detection ---
    const w = this.width;

    // Based on Android & iOS logical width standards
    if (w <= 600) {
      this.isPhone = true;
      this.isTablet = false;
    } else {
      this.isPhone = false;
      this.isTablet = true;
    }

    // --- Phone Sizes ---
    this.isSmallPhone = this.isPhone && w <= 390;
    this.isLargePhone = this.isPhone && w > 390;

    // --- Tablet Sizes ---
    this.isSmallTablet = this.isTablet && w <= 720;
    this.isLargeTablet = this.isTablet && w > 720;

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

// ------------- UTILS -------------

function applyClamp(
  value: number,
  opts?: { min?: number; max?: number }
): number {
  if (!opts) return value;
  if (opts.min !== undefined) value = Math.max(opts.min, value);
  if (opts.max !== undefined) value = Math.min(opts.max, value);
  return value;
}

// ------------- SCALING UTILITIES -------------

/**
 * Scales a size based on the screen dimensions with width priority
 * Good for horizontal measurements and general sizing
 * @param size The size to scale
 * @param opts Optional clamp options { min?, max? }
 * @returns The scaled size
 */
export function scale(
  size: number,
  opts?: { min?: number; max?: number }
): number {
  const raw = Math.round(size * Device.baseUnit * 10) / 10;
  return applyClamp(raw, opts);
}

/**
 * Scales a size with height bias for vertical measurements
 * Good for heights, vertical margins, etc.
 * @param size The size to scale vertically
 * @param opts Optional clamp options { min?, max? }
 * @returns The vertically scaled size
 */
export function verticalScale(
  size: number,
  opts?: { min?: number; max?: number }
): number {
  const heightRatio = Device.height / (Device.isTablet ? 1024 : 812);
  const raw = Math.round(size * heightRatio * 10) / 10;
  return applyClamp(raw, opts);
}

/**
 * Moderately scales a size with a mix of width and height factors
 * Good for elements that need balanced scaling
 * @param size The size to scale
 * @param factor How much to weigh width vs height (0-1, default 0.5)
 * @param opts Optional clamp options { min?, max? }
 * @returns The moderately scaled size
 */
export function moderateScale(
  size: number,
  factor: number = 0.5,
  opts?: { min?: number; max?: number }
): number {
  const widthFactor = Device.width / (Device.isTablet ? 768 : 375);
  const heightFactor = Device.height / (Device.isTablet ? 1024 : 812);
  const scaleFactor = widthFactor * (1 - factor) + heightFactor * factor;
  const raw = Math.round(size * scaleFactor * 10) / 10;
  return applyClamp(raw, opts);
}

/**
 * Scales a font size with additional adjustments for device type
 * Applies special handling for readability across different devices
 * @param size The font size to scale
 * @param opts Optional clamp options { min?, max? }
 * @returns The scaled font size
 */
export function scaleFontSize(
  size: number,
  opts?: { min?: number; max?: number }
): number {
  let adjustedSize = size;

  if (Device.isSmallPhone) adjustedSize *= 0.9;
  else if (Device.isSmallTablet) adjustedSize *= 1.05;
  else if (Device.isLargeTablet) adjustedSize *= 1.1;

  const widthRatio = Device.width / (Device.isTablet ? 768 : 375);
  const heightRatio = Device.height / (Device.isTablet ? 1024 : 812);
  const fontRatio = widthRatio * 0.65 + heightRatio * 0.35;

  const accessibilityScale = Math.sqrt(Device.fontScale);

  const raw =
    Math.round(adjustedSize * fontRatio * accessibilityScale * 10) / 10;

  const minSize = size * 0.7;
  const maxSize = size * 1.6;

  const clampedRaw = Math.min(Math.max(raw, minSize), maxSize);

  return applyClamp(clampedRaw, opts);
}

/**
 * Scales a value with tablet-specific multiplier
 * Perfect for UI elements that need to be bigger on tablets (buttons, icons, spacing)
 * @param size The base size to scale
 * @param tabletFactor Multiplier for tablets (default: 1.3)
 * @param opts Optional clamp options { min?, max? }
 * @returns Scaled size (with tablet multiplier if on tablet)
 *
 * @example
 * // Button height: 48 on phone, ~62 on tablet
 * height: scaleTablet(48, 1.3)
 *
 * // Icon size: 24 on phone, ~30 on tablet
 * size: scaleTablet(24, 1.25)
 */
export function scaleTablet(
  size: number,
  tabletFactor: number = 1.3,
  opts?: { min?: number; max?: number }
): number {
  const adjustedSize = Device.isTablet ? size * tabletFactor : size;
  const raw = Math.round(adjustedSize * Device.baseUnit * 10) / 10;
  return applyClamp(raw, opts);
}

/**
 * Conditional value based on device type
 * Returns different values for phone vs tablet
 * @param phoneValue Value to use on phones
 * @param tabletValue Value to use on tablets
 * @returns The appropriate value for current device
 *
 * @example
 * // Different column counts
 * numColumns: deviceValue(2, 4)
 *
 * // Different sizes without scaling
 * fontSize: deviceValue(16, 18)
 */
export function deviceValue<T>(phoneValue: T, tabletValue: T): T {
  return Device.isTablet ? tabletValue : phoneValue;
}

/**
 * Clamps a value to a minimum and maximum value.
 * @param min The minimum allowed value
 * @param value The value to clamp
 * @param max The maximum allowed value
 * @returns The clamped value
 */
export function clampValue(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * Clamps a value to a minimum value.
 * @param min The minimum allowed value
 * @param value The value to clamp
 */
export function clampMin(min: number, value: number): number {
  return Math.max(min, value);
}

/**
 * Clamps a value to a maximum value.
 * @param value The value to clamp
 * @param max The maximum allowed value
 */
export function clampMax(value: number, max: number): number {
  return Math.min(value, max);
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

  st: scaleTablet, // Tablet-aware scaling for UI elements
  dv: deviceValue, // Device value (phone vs tablet)

  // Clamp utilities with short aliases
  cl: clampValue, // shorter alias
  clMin: clampMin,
  clMax: clampMax,

  // Device detection instance
  device: Device, // Provides info like isTablet, hasNotch, baseUnit, etc.

  // Hook for listening to dimension/orientation changes in real-time
  useDimensions: useResponsiveDimensions, // Returns window/screen + orientation
};
