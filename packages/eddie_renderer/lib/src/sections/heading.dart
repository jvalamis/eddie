import 'package:flutter/material.dart';

/// Heading section widget
class HeadingSection extends StatelessWidget {
  final int level;
  final String text;

  const HeadingSection({
    super.key,
    required this.level,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    TextStyle? style;
    EdgeInsets padding;
    
    switch (level) {
      case 1:
        style = theme.textTheme.displayMedium?.copyWith(
          fontWeight: FontWeight.bold,
        );
        padding = const EdgeInsets.only(bottom: 24, top: 32);
        break;
      case 2:
        style = theme.textTheme.headlineMedium?.copyWith(
          fontWeight: FontWeight.bold,
        );
        padding = const EdgeInsets.only(bottom: 20, top: 28);
        break;
      case 3:
        style = theme.textTheme.headlineSmall?.copyWith(
          fontWeight: FontWeight.w600,
        );
        padding = const EdgeInsets.only(bottom: 16, top: 24);
        break;
      case 4:
        style = theme.textTheme.titleLarge?.copyWith(
          fontWeight: FontWeight.w600,
        );
        padding = const EdgeInsets.only(bottom: 12, top: 20);
        break;
      case 5:
        style = theme.textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.w600,
        );
        padding = const EdgeInsets.only(bottom: 8, top: 16);
        break;
      case 6:
        style = theme.textTheme.titleSmall?.copyWith(
          fontWeight: FontWeight.w600,
        );
        padding = const EdgeInsets.only(bottom: 8, top: 16);
        break;
      default:
        style = theme.textTheme.headlineSmall?.copyWith(
          fontWeight: FontWeight.w600,
        );
        padding = const EdgeInsets.only(bottom: 16, top: 24);
    }

    return Padding(
      padding: padding,
      child: Text(
        text,
        style: style,
      ),
    );
  }
}
