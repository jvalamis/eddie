import 'package:flutter/material.dart';

/// Design Rule #2: Adaptive Layout (Content-Led)
/// Breakpoints: <600 mobile, 600–1024 tablet, >1024 desktop
/// Max content width ~1200px; reading width 60–75ch
/// 8pt spacing scale (4,8,12,16,24,32,48,64)
class ResponsiveLayout {
  // Breakpoints following Design Rule #2
  static const double mobileBreakpoint = 600;
  static const double tabletBreakpoint = 1024;
  static const double maxContentWidth = 1200;
  static const double readingWidth = 75; // 75ch

  // Design Rule #2: 8pt spacing scale
  static const double spacing4 = 4;
  static const double spacing6 = 6;
  static const double spacing8 = 8;
  static const double spacing12 = 12;
  static const double spacing16 = 16;
  static const double spacing20 = 20;
  static const double spacing24 = 24;
  static const double spacing32 = 32;
  static const double spacing48 = 48;
  static const double spacing64 = 64;

  /// Get the current screen type based on width
  static ScreenType getScreenType(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width < mobileBreakpoint) {
      return ScreenType.mobile;
    } else if (width < tabletBreakpoint) {
      return ScreenType.tablet;
    } else {
      return ScreenType.desktop;
    }
  }

  /// Get responsive padding based on screen type
  static EdgeInsets getResponsivePadding(BuildContext context) {
    final screenType = getScreenType(context);
    switch (screenType) {
      case ScreenType.mobile:
        return const EdgeInsets.all(spacing16);
      case ScreenType.tablet:
        return const EdgeInsets.all(spacing24);
      case ScreenType.desktop:
        return const EdgeInsets.all(spacing32);
    }
  }

  /// Get responsive content width
  static double getContentWidth(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenType = getScreenType(context);
    
    switch (screenType) {
      case ScreenType.mobile:
        return screenWidth - (spacing16 * 2); // Full width minus padding
      case ScreenType.tablet:
        return (screenWidth * 0.8).clamp(600, maxContentWidth);
      case ScreenType.desktop:
        return maxContentWidth;
    }
  }

  /// Get responsive reading width (for text content)
  static double getReadingWidth(BuildContext context) {
    final screenType = getScreenType(context);
    switch (screenType) {
      case ScreenType.mobile:
        return MediaQuery.of(context).size.width - (spacing16 * 2);
      case ScreenType.tablet:
        return (MediaQuery.of(context).size.width * 0.6).clamp(400, 600);
      case ScreenType.desktop:
        return 600; // 75ch equivalent
    }
  }

  /// Get responsive grid columns
  static int getGridColumns(BuildContext context) {
    final screenType = getScreenType(context);
    switch (screenType) {
      case ScreenType.mobile:
        return 1;
      case ScreenType.tablet:
        return 2;
      case ScreenType.desktop:
        return 3;
    }
  }

  /// Alias for getGridColumns to match the new design system
  static int getCrossAxisCount(BuildContext context) {
    return getGridColumns(context);
  }

  /// Get responsive navigation type
  /// Design Rule #3: Navigation by Size
  static NavigationType getNavigationType(BuildContext context) {
    final screenType = getScreenType(context);
    switch (screenType) {
      case ScreenType.mobile:
        return NavigationType.bottomNav;
      case ScreenType.tablet:
        return NavigationType.navRail;
      case ScreenType.desktop:
        return NavigationType.sideNav;
    }
  }
}

enum ScreenType { mobile, tablet, desktop }
enum NavigationType { bottomNav, navRail, sideNav }

/// Responsive wrapper widget that provides consistent spacing and layout
class ResponsiveContainer extends StatelessWidget {
  final Widget child;
  final bool useReadingWidth;
  final EdgeInsets? padding;

  const ResponsiveContainer({
    super.key,
    required this.child,
    this.useReadingWidth = false,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    final contentWidth = useReadingWidth
        ? ResponsiveLayout.getReadingWidth(context)
        : ResponsiveLayout.getContentWidth(context);
    
    final responsivePadding = padding ?? ResponsiveLayout.getResponsivePadding(context);

    return Center(
      child: Container(
        width: contentWidth,
        padding: responsivePadding,
        child: child,
      ),
    );
  }
}

/// Responsive grid widget that adapts columns based on screen size
class ResponsiveGrid extends StatelessWidget {
  final List<Widget> children;
  final double spacing;
  final double runSpacing;

  const ResponsiveGrid({
    super.key,
    required this.children,
    this.spacing = ResponsiveLayout.spacing16,
    this.runSpacing = ResponsiveLayout.spacing16,
  });

  @override
  Widget build(BuildContext context) {
    final columns = ResponsiveLayout.getGridColumns(context);
    
    return Wrap(
      spacing: spacing,
      runSpacing: runSpacing,
      children: children.map((child) {
        return SizedBox(
          width: (ResponsiveLayout.getContentWidth(context) - 
                 (spacing * (columns - 1))) / columns,
          child: child,
        );
      }).toList(),
    );
  }
}
