import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/responsive_layout.dart';

/// Comprehensive theme system implementing all design rules
class AppTheme {
  // Design Rule #1: Material 3 with ColorScheme.fromSeed
  // Dynamic color scheme that adapts to content
  static const Color brandSeed = Color(0xFF6750A4); // Material 3 default
  static const Color artsSeed = Color(0xFF9C27B0); // Vibrant purple for arts/culture
  static const Color businessSeed = Color(0xFF2196F3); // Bright blue for business
  static const Color educationSeed = Color(0xFF4CAF50); // Fresh green for education
  static const Color healthSeed = Color(0xFFE91E63); // Pink for health
  static const Color techSeed = Color(0xFFFF9800); // Vibrant orange for tech
  
  /// Get dynamic seed color based on website content
  static Color getSeedColorForContent(String domain, String title, String description) {
    final content = '${domain.toLowerCase()} ${title.toLowerCase()} ${description.toLowerCase()}';
    
    if (content.contains('art') || content.contains('culture') || content.contains('creative') || 
        content.contains('music') || content.contains('theater') || content.contains('gallery')) {
      return artsSeed;
    } else if (content.contains('business') || content.contains('corporate') || 
               content.contains('company') || content.contains('enterprise')) {
      return businessSeed;
    } else if (content.contains('education') || content.contains('school') || 
               content.contains('university') || content.contains('learning') || 
               content.contains('academic')) {
      return educationSeed;
    } else if (content.contains('health') || content.contains('medical') || 
               content.contains('hospital') || content.contains('clinic')) {
      return healthSeed;
    } else if (content.contains('tech') || content.contains('software') || 
               content.contains('digital') || content.contains('app') || 
               content.contains('development')) {
      return techSeed;
    }
    
    return brandSeed; // Default
  }
  
  /// Light theme following all design rules
  static ThemeData get lightTheme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: brandSeed,
      brightness: Brightness.light,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      
      // Design Rule #4: Typography that sells the message
      textTheme: buildTextTheme(colorScheme),
      
      // Design Rule #6: Components & shape language
      cardTheme: buildCardTheme(),
      appBarTheme: buildAppBarTheme(colorScheme),
      navigationBarTheme: buildNavigationBarTheme(colorScheme),
      navigationRailTheme: buildNavigationRailTheme(colorScheme),
      drawerTheme: buildDrawerTheme(colorScheme),
      listTileTheme: buildListTileTheme(colorScheme),
      chipTheme: buildChipTheme(colorScheme),
      buttonTheme: buildButtonTheme(colorScheme),
      elevatedButtonTheme: buildElevatedButtonTheme(colorScheme),
      outlinedButtonTheme: buildOutlinedButtonTheme(colorScheme),
      textButtonTheme: buildTextButtonTheme(colorScheme),
      inputDecorationTheme: buildInputDecorationTheme(colorScheme),
      
      // Design Rule #5: Motion = micro, not flashy
      pageTransitionsTheme: buildPageTransitionsTheme(),
      
      // Design Rule #8: Accessibility
      visualDensity: VisualDensity.adaptivePlatformDensity,
    );
  }

  /// Dark theme following all design rules
  static ThemeData get darkTheme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: brandSeed,
      brightness: Brightness.dark,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      
      // Design Rule #4: Typography that sells the message
      textTheme: buildTextTheme(colorScheme),
      
      // Design Rule #6: Components & shape language
      cardTheme: buildCardTheme(),
      appBarTheme: buildAppBarTheme(colorScheme),
      navigationBarTheme: buildNavigationBarTheme(colorScheme),
      navigationRailTheme: buildNavigationRailTheme(colorScheme),
      drawerTheme: buildDrawerTheme(colorScheme),
      listTileTheme: buildListTileTheme(colorScheme),
      chipTheme: buildChipTheme(colorScheme),
      buttonTheme: buildButtonTheme(colorScheme),
      elevatedButtonTheme: buildElevatedButtonTheme(colorScheme),
      outlinedButtonTheme: buildOutlinedButtonTheme(colorScheme),
      textButtonTheme: buildTextButtonTheme(colorScheme),
      inputDecorationTheme: buildInputDecorationTheme(colorScheme),
      
      // Design Rule #5: Motion = micro, not flashy
      pageTransitionsTheme: buildPageTransitionsTheme(),
      
      // Design Rule #8: Accessibility
      visualDensity: VisualDensity.adaptivePlatformDensity,
    );
  }

  /// Design Rule #4: Typography that sells the message
  /// Typography.material2021() + GoogleFonts
  /// Headings clamp 1–2 lines; body LH ~1.4–1.6
  /// Clear hierarchy: Display → Headline → Title → Body/Label
  static TextTheme buildTextTheme(ColorScheme colorScheme) {
    final baseTextTheme = GoogleFonts.interTextTheme();
    
    return baseTextTheme.copyWith(
      // Display styles
      displayLarge: baseTextTheme.displayLarge?.copyWith(
        fontSize: 57,
        fontWeight: FontWeight.w400,
        letterSpacing: -0.25,
        height: 1.12,
        color: colorScheme.onSurface,
      ),
      displayMedium: baseTextTheme.displayMedium?.copyWith(
        fontSize: 45,
        fontWeight: FontWeight.w400,
        letterSpacing: 0,
        height: 1.16,
        color: colorScheme.onSurface,
      ),
      displaySmall: baseTextTheme.displaySmall?.copyWith(
        fontSize: 36,
        fontWeight: FontWeight.w400,
        letterSpacing: 0,
        height: 1.22,
        color: colorScheme.onSurface,
      ),
      
      // Headline styles
      headlineLarge: baseTextTheme.headlineLarge?.copyWith(
        fontSize: 32,
        fontWeight: FontWeight.w400,
        letterSpacing: 0,
        height: 1.25,
        color: colorScheme.onSurface,
      ),
      headlineMedium: baseTextTheme.headlineMedium?.copyWith(
        fontSize: 28,
        fontWeight: FontWeight.w400,
        letterSpacing: 0,
        height: 1.29,
        color: colorScheme.onSurface,
      ),
      headlineSmall: baseTextTheme.headlineSmall?.copyWith(
        fontSize: 24,
        fontWeight: FontWeight.w400,
        letterSpacing: 0,
        height: 1.33,
        color: colorScheme.onSurface,
      ),
      
      // Title styles
      titleLarge: baseTextTheme.titleLarge?.copyWith(
        fontSize: 22,
        fontWeight: FontWeight.w400,
        letterSpacing: 0,
        height: 1.27,
        color: colorScheme.onSurface,
      ),
      titleMedium: baseTextTheme.titleMedium?.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.15,
        height: 1.50,
        color: colorScheme.onSurface,
      ),
      titleSmall: baseTextTheme.titleSmall?.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.1,
        height: 1.43,
        color: colorScheme.onSurface,
      ),
      
      // Body styles
      bodyLarge: baseTextTheme.bodyLarge?.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.5,
        height: 1.50, // Design Rule #4: body LH ~1.4–1.6
        color: colorScheme.onSurface,
      ),
      bodyMedium: baseTextTheme.bodyMedium?.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.25,
        height: 1.43,
        color: colorScheme.onSurface,
      ),
      bodySmall: baseTextTheme.bodySmall?.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.4,
        height: 1.33,
        color: colorScheme.onSurfaceVariant,
      ),
      
      // Label styles
      labelLarge: baseTextTheme.labelLarge?.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.1,
        height: 1.43,
        color: colorScheme.onSurface,
      ),
      labelMedium: baseTextTheme.labelMedium?.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        height: 1.33,
        color: colorScheme.onSurface,
      ),
      labelSmall: baseTextTheme.labelSmall?.copyWith(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        height: 1.45,
        color: colorScheme.onSurface,
      ),
    );
  }

  /// Design Rule #6: Components & shape language
  /// Corners 12–16; low elevation; subtle dividers
  static CardTheme buildCardTheme() {
    return CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12), // Design Rule #6: Corners 12–16
      ),
      margin: EdgeInsets.all(ResponsiveLayout.spacing8),
    );
  }

  static AppBarTheme buildAppBarTheme(ColorScheme colorScheme) {
    return AppBarTheme(
      elevation: 0,
      centerTitle: false,
      titleTextStyle: GoogleFonts.inter(
        fontSize: 22,
        fontWeight: FontWeight.w400,
        color: colorScheme.onSurface,
      ),
      backgroundColor: colorScheme.surface,
      foregroundColor: colorScheme.onSurface,
    );
  }

  static NavigationBarThemeData buildNavigationBarTheme(ColorScheme colorScheme) {
    return NavigationBarThemeData(
      elevation: 3,
      backgroundColor: colorScheme.surface,
      indicatorColor: colorScheme.secondaryContainer,
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: colorScheme.onSurface,
          );
        }
        return GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: colorScheme.onSurfaceVariant,
        );
      }),
    );
  }

  static NavigationRailThemeData buildNavigationRailTheme(ColorScheme colorScheme) {
    return NavigationRailThemeData(
      backgroundColor: colorScheme.surface,
      selectedIconTheme: IconThemeData(
        color: colorScheme.onSurface,
        size: 24,
      ),
      unselectedIconTheme: IconThemeData(
        color: colorScheme.onSurfaceVariant,
        size: 24,
      ),
      selectedLabelTextStyle: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: colorScheme.onSurface,
      ),
      unselectedLabelTextStyle: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: colorScheme.onSurfaceVariant,
      ),
    );
  }

  static DrawerThemeData buildDrawerTheme(ColorScheme colorScheme) {
    return DrawerThemeData(
      backgroundColor: colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topRight: Radius.circular(16),
          bottomRight: Radius.circular(16),
        ),
      ),
    );
  }

  static ListTileThemeData buildListTileTheme(ColorScheme colorScheme) {
    return ListTileThemeData(
      contentPadding: EdgeInsets.symmetric(
        horizontal: ResponsiveLayout.spacing16,
        vertical: ResponsiveLayout.spacing8,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    );
  }

  static ChipThemeData buildChipTheme(ColorScheme colorScheme) {
    return ChipThemeData(
      backgroundColor: colorScheme.surfaceVariant,
      selectedColor: colorScheme.secondaryContainer,
      labelStyle: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: colorScheme.onSurfaceVariant,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      padding: EdgeInsets.symmetric(
        horizontal: ResponsiveLayout.spacing12,
        vertical: ResponsiveLayout.spacing4,
      ),
    );
  }

  static ButtonThemeData buildButtonTheme(ColorScheme colorScheme) {
    return ButtonThemeData(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      padding: EdgeInsets.symmetric(
        horizontal: ResponsiveLayout.spacing16,
        vertical: ResponsiveLayout.spacing8,
      ),
    );
  }

  static ElevatedButtonThemeData buildElevatedButtonTheme(ColorScheme colorScheme) {
    return ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: colorScheme.primary,
        foregroundColor: colorScheme.onPrimary,
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        padding: EdgeInsets.symmetric(
          horizontal: ResponsiveLayout.spacing16,
          vertical: ResponsiveLayout.spacing12,
        ),
        textStyle: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  static OutlinedButtonThemeData buildOutlinedButtonTheme(ColorScheme colorScheme) {
    return OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: colorScheme.primary,
        side: BorderSide(color: colorScheme.outline),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        padding: EdgeInsets.symmetric(
          horizontal: ResponsiveLayout.spacing16,
          vertical: ResponsiveLayout.spacing12,
        ),
        textStyle: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  static TextButtonThemeData buildTextButtonTheme(ColorScheme colorScheme) {
    return TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: colorScheme.primary,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        padding: EdgeInsets.symmetric(
          horizontal: ResponsiveLayout.spacing16,
          vertical: ResponsiveLayout.spacing12,
        ),
        textStyle: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  static InputDecorationTheme buildInputDecorationTheme(ColorScheme colorScheme) {
    return InputDecorationTheme(
      filled: true,
      fillColor: colorScheme.surfaceVariant,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: colorScheme.outline),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: colorScheme.outline),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: colorScheme.primary, width: 2),
      ),
      contentPadding: EdgeInsets.symmetric(
        horizontal: ResponsiveLayout.spacing16,
        vertical: ResponsiveLayout.spacing12,
      ),
    );
  }

  /// Design Rule #5: Motion = micro, not flashy
  /// Durations ~150–300ms, Material easing
  static PageTransitionsTheme buildPageTransitionsTheme() {
    return const PageTransitionsTheme(
      builders: {
        TargetPlatform.android: CupertinoPageTransitionsBuilder(),
        TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
        TargetPlatform.macOS: CupertinoPageTransitionsBuilder(),
        TargetPlatform.windows: CupertinoPageTransitionsBuilder(),
        TargetPlatform.linux: CupertinoPageTransitionsBuilder(),
      },
    );
  }
}
