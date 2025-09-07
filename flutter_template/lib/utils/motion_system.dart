import 'package:flutter/material.dart';

/// Design Rule #5: Motion = micro, not flashy
/// Durations ~150–300ms, Material easing
/// Page transitions, button presses, list reorders, hero images
class MotionSystem {
  // Design Rule #5: Durations ~150–300ms
  static const Duration microDuration = Duration(milliseconds: 150);
  static const Duration standardDuration = Duration(milliseconds: 200);
  static const Duration extendedDuration = Duration(milliseconds: 300);

  // Material easing curves
  static const Curve materialEasing = Curves.easeInOut;
  static const Curve materialAccelerate = Curves.easeIn;
  static const Curve materialDecelerate = Curves.easeOut;

  /// Standard page transition animation
  static Widget buildPageTransition({
    required Widget child,
    required Animation<double> animation,
    required Animation<double> secondaryAnimation,
  }) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(1.0, 0.0),
        end: Offset.zero,
      ).animate(CurvedAnimation(
        parent: animation,
        curve: materialEasing,
      )),
      child: FadeTransition(
        opacity: animation,
        child: child,
      ),
    );
  }

  /// Card hover animation
  static Widget buildHoverCard({
    required Widget child,
    required bool isHovered,
  }) {
    return AnimatedContainer(
      duration: microDuration,
      curve: materialEasing,
      transform: Matrix4.identity()
        ..scale(isHovered ? 1.02 : 1.0),
      child: AnimatedContainer(
        duration: microDuration,
        curve: materialEasing,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          boxShadow: isHovered
              ? [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: child,
      ),
    );
  }

  /// Button press animation
  static Widget buildPressButton({
    required Widget child,
    required VoidCallback onPressed,
    required bool isPressed,
  }) {
    return AnimatedScale(
      scale: isPressed ? 0.95 : 1.0,
      duration: microDuration,
      curve: materialEasing,
      child: GestureDetector(
        onTapDown: (_) => onPressed(),
        child: child,
      ),
    );
  }

  /// List item reorder animation
  static Widget buildReorderableItem({
    required Widget child,
    required int index,
    required bool isDragging,
  }) {
    return AnimatedContainer(
      duration: standardDuration,
      curve: materialEasing,
      transform: Matrix4.identity()
        ..scale(isDragging ? 1.05 : 1.0),
      child: AnimatedContainer(
        duration: standardDuration,
        curve: materialEasing,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          boxShadow: isDragging
              ? [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.15),
                    blurRadius: 12,
                    offset: const Offset(0, 6),
                  ),
                ]
              : null,
        ),
        child: child,
      ),
    );
  }

  /// Hero image animation
  static Widget buildHeroImage({
    required String tag,
    required Widget child,
    required VoidCallback? onTap,
  }) {
    return Hero(
      tag: tag,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: AnimatedContainer(
            duration: standardDuration,
            curve: materialEasing,
            child: child,
          ),
        ),
      ),
    );
  }

  /// Loading skeleton animation
  static Widget buildSkeletonLoader({
    required double width,
    required double height,
    BorderRadius? borderRadius,
  }) {
    return TweenAnimationBuilder<double>(
      duration: const Duration(milliseconds: 1000),
      tween: Tween(begin: 0.0, end: 1.0),
      builder: (context, value, child) {
        return Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            borderRadius: borderRadius ?? BorderRadius.circular(8),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Colors.grey[300]!,
                Colors.grey[100]!,
                Colors.grey[300]!,
              ],
              stops: [
                value - 0.3,
                value,
                value + 0.3,
              ].map((stop) => stop.clamp(0.0, 1.0)).toList(),
            ),
          ),
        );
      },
    );
  }

  /// Fade in animation for content
  static Widget buildFadeInContent({
    required Widget child,
    required bool isVisible,
    Duration? duration,
  }) {
    return AnimatedOpacity(
      opacity: isVisible ? 1.0 : 0.0,
      duration: duration ?? standardDuration,
      curve: materialEasing,
      child: child,
    );
  }

  /// Slide in animation for content
  static Widget buildSlideInContent({
    required Widget child,
    required bool isVisible,
    Offset beginOffset = const Offset(0, 0.3),
    Duration? duration,
  }) {
    return AnimatedSlide(
      offset: isVisible ? Offset.zero : beginOffset,
      duration: duration ?? standardDuration,
      curve: materialEasing,
      child: AnimatedOpacity(
        opacity: isVisible ? 1.0 : 0.0,
        duration: duration ?? standardDuration,
        curve: materialEasing,
        child: child,
      ),
    );
  }

  /// Staggered animation for lists
  static Widget buildStaggeredList({
    required List<Widget> children,
    required bool isVisible,
    Duration? staggerDelay,
  }) {
    return Column(
      children: children.asMap().entries.map((entry) {
        final index = entry.key;
        final child = entry.value;
        final delay = (staggerDelay ?? const Duration(milliseconds: 100)) * index;
        
        return TweenAnimationBuilder<double>(
          duration: standardDuration + delay,
          tween: Tween(begin: 0.0, end: isVisible ? 1.0 : 0.0),
          builder: (context, value, _) {
            return Transform.translate(
              offset: Offset(0, 20 * (1 - value)),
              child: Opacity(
                opacity: value,
                child: child,
              ),
            );
          },
        );
      }).toList(),
    );
  }
}
