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

  // if (Device.isSmallPhone) adjustedSize *= 0.9;
  // if (Device.isTablet) adjustedSize *= Device.isLargeTablet ? 1.95 : 1.95;
  if (Device.isSmallPhone) adjustedSize *= 0.9;
  else if (Device.isLargePhone)
    adjustedSize *= 1.0; // Normal phones (baseline)
  else if (Device.isSmallTablet) adjustedSize *= 1.3;
  else if (Device.isLargeTablet) adjustedSize *= 1.5;

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
 * Computes an adaptive, production-ready line height for typography.
 * Automatically applies font scaling and device multipliers for readability.
 *
 * @param baseFontSize The *design* font size (unscaled, e.g. 16, 18, 28)
 * @returns A properly scaled line height value
 */
export function getLineHeight(baseFontSize: number): number {
  // 1️⃣ First, apply your font scaling logic
  const scaledFont = scaleFontSize(baseFontSize);

  // 2️⃣ Define a baseline ratio
  let ratio = 1.25; // standard web/Material baseline

  // 3️⃣ Adjust per device type
  if (Device.isSmallPhone) ratio = 1.2;
  else if (Device.isLargePhone) ratio = 1.25;
  else if (Device.isSmallTablet) ratio = 1.35;
  else if (Device.isLargeTablet) ratio = 1.45;

  // 4️⃣ Adjust for extreme accessibility fontScale (optional)
  // Keeps line height proportional when user scales text very large
  const fontScaleAdjustment = Math.min(Device.fontScale, 1.4);
  const adjustedRatio = ratio * (fontScaleAdjustment / 1.2);

  // 5️⃣ Compute the final line height
  const lineHeight = Math.round(scaledFont * adjustedRatio);

  return lineHeight;
}

/**
 * Scales icon sizes intelligently across devices.
 * Keeps visual balance with text while preventing oversized icons on tablets.
 *
 * @param baseSize The design icon size (e.g. 20, 24, 32)
 * @returns The scaled icon size
 */
export function getIconSize(baseSize: number): number {
  // 1️⃣ Start with a moderate scale (width-biased)
  const widthRatio = Device.width / (Device.isTablet ? 768 : 375);
  const heightRatio = Device.height / (Device.isTablet ? 1024 : 812);
  const baseScale = widthRatio * 0.65 + heightRatio * 0.35;

  // 2️⃣ Device-specific adjustments
  let scaleMultiplier = 1.0;

  if (Device.isSmallPhone) scaleMultiplier = 0.9;
  else if (Device.isLargePhone) scaleMultiplier = 1.0;
  else if (Device.isSmallTablet) scaleMultiplier = 1.15;
  else if (Device.isLargeTablet) scaleMultiplier = 1.25;

  // 3️⃣ Combine scaling
  let scaled = baseSize * baseScale * scaleMultiplier;

  // 4️⃣ Optional — mild adjustment for fontScale (helps accessibility)
  const fontScaleAdjust = Math.min(Device.fontScale, 1.3);
  scaled *= fontScaleAdjust * 0.95;

  // 5️⃣ Clamp to avoid extreme jumps
  const min = baseSize * 0.8;
  const max = baseSize * 1.5;
  scaled = Math.min(Math.max(scaled, min), max);

  // 6️⃣ Round for pixel-perfect rendering
  return Math.round(scaled);
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
  lh: getLineHeight,
  ic: getIconSize, // 👈 new addition

  // Clamp utilities with short aliases
  cl: clampValue, // shorter alias
  clMin: clampMin,
  clMax: clampMax,

  // Device detection instance
  device: Device, // Provides info like isTablet, hasNotch, baseUnit, etc.

  // Hook for listening to dimension/orientation changes in real-time
  useDimensions: useResponsiveDimensions, // Returns window/screen + orientation
};
