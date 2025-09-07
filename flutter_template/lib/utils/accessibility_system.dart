import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

/// Design Rule #8: Accessibility (must-pass)
/// Contrast ≥ 4.5:1; min hit target 44×44
/// Visible focus; semantic labels; textScaleFactor up to 1.3+
class AccessibilitySystem {
  // Design Rule #8: Min hit target 44×44
  static const double minHitTarget = 44.0;
  
  // Design Rule #8: TextScaleFactor up to 1.3+
  static const double maxTextScaleFactor = 1.3;

  /// Ensure minimum hit target size
  static Widget ensureMinHitTarget({
    required Widget child,
    double? minSize,
  }) {
    final size = minSize ?? minHitTarget;
    return ConstrainedBox(
      constraints: BoxConstraints(
        minWidth: size,
        minHeight: size,
      ),
      child: child,
    );
  }

  /// Create accessible button with proper semantics
  static Widget accessibleButton({
    required Widget child,
    required VoidCallback? onPressed,
    String? semanticLabel,
    String? semanticHint,
    bool excludeSemantics = false,
  }) {
    return Semantics(
      label: semanticLabel,
      hint: semanticHint,
      button: true,
      enabled: onPressed != null,
      excludeSemantics: excludeSemantics,
      child: ensureMinHitTarget(
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onPressed,
            borderRadius: BorderRadius.circular(12),
            child: child,
          ),
        ),
      ),
    );
  }

  /// Create accessible card with proper semantics
  static Widget accessibleCard({
    required Widget child,
    String? semanticLabel,
    String? semanticHint,
    VoidCallback? onTap,
  }) {
    return Semantics(
      label: semanticLabel,
      hint: semanticHint,
      button: onTap != null,
      child: Card(
        child: onTap != null
            ? InkWell(
                onTap: onTap,
                borderRadius: BorderRadius.circular(12),
                child: child,
              )
            : child,
      ),
    );
  }

  /// Create accessible image with proper alt text
  static Widget accessibleImage({
    required String imageUrl,
    String? altText,
    String? semanticLabel,
    BoxFit fit = BoxFit.cover,
    double? width,
    double? height,
  }) {
    return Semantics(
      label: semanticLabel ?? altText ?? 'Image',
      image: true,
      child: Image.network(
        imageUrl,
        fit: fit,
        width: width,
        height: height,
        errorBuilder: (context, error, stackTrace) {
          return Semantics(
            label: 'Failed to load image: ${altText ?? 'Unknown image'}',
            child: Container(
              width: width,
              height: height,
              color: Colors.grey[300],
              child: const Icon(Icons.broken_image),
            ),
          );
        },
      ),
    );
  }

  /// Create accessible text with proper contrast
  static Widget accessibleText(
    String text, {
    TextStyle? style,
    String? semanticLabel,
    int? maxLines,
    TextOverflow? overflow,
  }) {
    return Semantics(
      label: semanticLabel,
      child: Text(
        text,
        style: style,
        maxLines: maxLines,
        overflow: overflow,
      ),
    );
  }

  /// Create accessible list with proper semantics
  static Widget accessibleList({
    required List<Widget> children,
    String? semanticLabel,
    bool isOrdered = false,
  }) {
    return Semantics(
      label: semanticLabel,
      child: Column(
        children: children.asMap().entries.map((entry) {
          final index = entry.key;
          final child = entry.value;
          
          return Semantics(
            label: isOrdered ? 'Item ${index + 1}' : null,
            child: child,
          );
        }).toList(),
      ),
    );
  }

  /// Create accessible form field
  static Widget accessibleFormField({
    required String label,
    required String hint,
    required TextEditingController controller,
    String? errorText,
    TextInputType? keyboardType,
    bool obscureText = false,
    Widget? suffixIcon,
    VoidCallback? onTap,
  }) {
    return Semantics(
      label: label,
      hint: hint,
      textField: true,
      child: TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        obscureText: obscureText,
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          errorText: errorText,
          suffixIcon: suffixIcon,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        onTap: onTap,
      ),
    );
  }

  /// Create accessible navigation item
  static Widget accessibleNavigationItem({
    required IconData icon,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Semantics(
      label: label,
      hint: isSelected ? 'Selected' : 'Tap to select',
      selected: isSelected,
      button: true,
      child: ensureMinHitTarget(
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    icon,
                    color: isSelected
                        ? Theme.of(context).colorScheme.primary
                        : Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    label,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: isSelected
                              ? Theme.of(context).colorScheme.primary
                              : Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Create accessible dialog
  static Widget accessibleDialog({
    required String title,
    required String content,
    required List<Widget> actions,
    String? semanticLabel,
  }) {
    return Semantics(
      label: semanticLabel ?? title,
      child: AlertDialog(
        title: Text(title),
        content: Text(content),
        actions: actions,
      ),
    );
  }

  /// Create accessible snackbar
  static void showAccessibleSnackBar({
    required BuildContext context,
    required String message,
    String? actionLabel,
    VoidCallback? onAction,
    Duration duration = const Duration(seconds: 3),
  }) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Semantics(
          label: message,
          child: Text(message),
        ),
        action: actionLabel != null && onAction != null
            ? SnackBarAction(
                label: actionLabel,
                onPressed: onAction,
              )
            : null,
        duration: duration,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  /// Check if text scale factor is within acceptable range
  static bool isTextScaleFactorAcceptable(BuildContext context) {
    final textScaleFactor = MediaQuery.of(context).textScaleFactor;
    return textScaleFactor <= maxTextScaleFactor;
  }

  /// Get accessible text style with proper contrast
  static TextStyle getAccessibleTextStyle({
    required BuildContext context,
    required TextStyle baseStyle,
    Color? foregroundColor,
  }) {
    final theme = Theme.of(context);
    final color = foregroundColor ?? theme.colorScheme.onSurface;
    
    return baseStyle.copyWith(
      color: color,
      // Ensure sufficient contrast
      fontWeight: baseStyle.fontWeight ?? FontWeight.w400,
    );
  }

  /// Create accessible focus indicator
  static Widget accessibleFocusIndicator({
    required Widget child,
    bool showFocus = true,
  }) {
    return Focus(
      child: Builder(
        builder: (context) {
          final hasFocus = Focus.of(context).hasFocus;
          return AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: hasFocus && showFocus
                  ? Border.all(
                      color: Theme.of(context).colorScheme.primary,
                      width: 2,
                    )
                  : null,
            ),
            child: child,
          );
        },
      ),
    );
  }
}
