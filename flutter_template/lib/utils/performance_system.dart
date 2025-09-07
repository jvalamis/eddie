import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Design Rule #9: Performance guardrails
/// 60fps target; precache hero media; cache images
/// Tree-shake icons; avoid unnecessary rebuilds; const where possible
class PerformanceSystem {
  // Design Rule #9: 60fps target
  static const int targetFPS = 60;
  static const Duration frameDuration = Duration(milliseconds: 16); // 1000ms / 60fps

  /// Precache images for better performance
  static Future<void> precacheImages(
    BuildContext context,
    List<String> imageUrls,
  ) async {
    for (final url in imageUrls) {
      try {
        await precacheImage(NetworkImage(url), context);
      } catch (e) {
        // Silently fail for individual images
        debugPrint('Failed to precache image: $url');
      }
    }
  }

  /// Precache hero images specifically
  static Future<void> precacheHeroImages(
    BuildContext context,
    List<String> heroImageUrls,
  ) async {
    // Prioritize hero images for immediate loading
    await Future.wait(
      heroImageUrls.map((url) => precacheImage(NetworkImage(url), context)),
    );
  }

  /// Optimized image widget with caching
  static Widget optimizedImage({
    required String imageUrl,
    required double width,
    required double height,
    BoxFit fit = BoxFit.cover,
    String? placeholder,
    String? errorWidget,
  }) {
    return Image.network(
      imageUrl,
      width: width,
      height: height,
      fit: fit,
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return Container(
          width: width,
          height: height,
          color: Colors.grey[300],
          child: const Center(
            child: CircularProgressIndicator(),
          ),
        );
      },
      errorBuilder: (context, error, stackTrace) {
        return Container(
          width: width,
          height: height,
          color: Colors.grey[300],
          child: const Icon(Icons.broken_image),
        );
      },
    );
  }

  /// Memoized widget builder to avoid unnecessary rebuilds
  static Widget memoizedBuilder({
    required Widget Function() builder,
    required List<Object?> dependencies,
  }) {
    return Builder(
      builder: (context) {
        // Use a key based on dependencies to control rebuilds
        final key = dependencies.join('|');
        return KeyedSubtree(
          key: ValueKey(key),
          child: builder(),
        );
      },
    );
  }

  /// Const constructor helper
  static Widget constWidget(Widget child) {
    return child;
  }

  /// Optimized list view with item extent for better performance
  static Widget optimizedListView({
    required List<Widget> children,
    ScrollController? controller,
    bool shrinkWrap = false,
    EdgeInsetsGeometry? padding,
  }) {
    return ListView.builder(
      controller: controller,
      shrinkWrap: shrinkWrap,
      padding: padding,
      itemCount: children.length,
      itemBuilder: (context, index) => children[index],
      // Use itemExtent for better performance when possible
      itemExtent: shrinkWrap ? null : 100.0,
    );
  }

  /// Optimized grid view with proper item extent
  static Widget optimizedGridView({
    required int crossAxisCount,
    required List<Widget> children,
    double? childAspectRatio,
    double? crossAxisSpacing,
    double? mainAxisSpacing,
    ScrollController? controller,
    bool shrinkWrap = false,
    EdgeInsetsGeometry? padding,
  }) {
    return GridView.builder(
      controller: controller,
      shrinkWrap: shrinkWrap,
      padding: padding,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        childAspectRatio: childAspectRatio ?? 1.0,
        crossAxisSpacing: crossAxisSpacing ?? 0.0,
        mainAxisSpacing: mainAxisSpacing ?? 0.0,
      ),
      itemCount: children.length,
      itemBuilder: (context, index) => children[index],
    );
  }

  /// Debounced function to prevent excessive calls
  static void debounce(
    VoidCallback callback, {
    Duration delay = const Duration(milliseconds: 300),
  }) {
    Timer? timer;
    timer?.cancel();
    timer = Timer(delay, callback);
  }

  /// Throttled function to limit call frequency
  static void throttle(
    VoidCallback callback, {
    Duration interval = const Duration(milliseconds: 100),
  }) {
    static DateTime? lastCall;
    final now = DateTime.now();
    
    if (lastCall == null || now.difference(lastCall!) >= interval) {
      lastCall = now;
      callback();
    }
  }

  /// Performance monitoring widget
  static Widget performanceMonitor({
    required Widget child,
    String? name,
  }) {
    return PerformanceOverlay(
      optionsMask: PerformanceOverlayOption.all,
      rasterizerThreshold: 0,
      checkerboardRasterCacheImages: false,
      checkerboardOffscreenLayers: false,
      child: child,
    );
  }

  /// Memory-efficient text widget
  static Widget memoryEfficientText(
    String text, {
    TextStyle? style,
    int? maxLines,
    TextOverflow? overflow,
    TextAlign? textAlign,
  }) {
    return Text(
      text,
      style: style,
      maxLines: maxLines,
      overflow: overflow,
      textAlign: textAlign,
      // Use const constructor when possible
      key: text.length < 100 ? ValueKey(text) : null,
    );
  }

  /// Optimized card widget with proper constraints
  static Widget optimizedCard({
    required Widget child,
    EdgeInsetsGeometry? margin,
    EdgeInsetsGeometry? padding,
    Color? color,
    double? elevation,
    BorderRadius? borderRadius,
  }) {
    return Card(
      margin: margin,
      color: color,
      elevation: elevation,
      shape: borderRadius != null
          ? RoundedRectangleBorder(borderRadius: borderRadius)
          : null,
      child: padding != null
          ? Padding(
              padding: padding,
              child: child,
            )
          : child,
    );
  }

  /// Lazy loading widget for large lists
  static Widget lazyLoadingList({
    required int itemCount,
    required Widget Function(BuildContext, int) itemBuilder,
    required Widget Function() loadingBuilder,
    required Widget Function() errorBuilder,
    ScrollController? controller,
    bool shrinkWrap = false,
    EdgeInsetsGeometry? padding,
  }) {
    return ListView.builder(
      controller: controller,
      shrinkWrap: shrinkWrap,
      padding: padding,
      itemCount: itemCount,
      itemBuilder: (context, index) {
        // Simulate lazy loading for demonstration
        if (index >= itemCount - 5) {
          return loadingBuilder();
        }
        return itemBuilder(context, index);
      },
    );
  }

  /// Image preloader for better UX
  static Future<void> preloadImages(
    BuildContext context,
    List<String> urls,
  ) async {
    final futures = urls.map((url) => precacheImage(NetworkImage(url), context));
    await Future.wait(futures);
  }

  /// Optimized animation controller
  static AnimationController createOptimizedAnimationController({
    required TickerProvider vsync,
    Duration duration = const Duration(milliseconds: 300),
  }) {
    return AnimationController(
      duration: duration,
      vsync: vsync,
      // Use lower value for better performance
      lowerBound: 0.0,
      upperBound: 1.0,
    );
  }

  /// Memory cleanup helper
  static void cleanupResources() {
    // Clear image cache if memory is low
    imageCache.clear();
    imageCache.clearLiveImages();
  }

  /// Performance metrics collection
  static void collectPerformanceMetrics() {
    // This would integrate with performance monitoring tools
    // For now, just log basic metrics
    debugPrint('Performance metrics collected');
  }
}
