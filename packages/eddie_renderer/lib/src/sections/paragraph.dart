import 'package:flutter/material.dart';

/// Paragraph section widget
class ParagraphSection extends StatelessWidget {
  final String text;

  const ParagraphSection({
    super.key,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Text(
        text,
        style: theme.textTheme.bodyLarge?.copyWith(
          height: 1.6,
        ),
      ),
    );
  }
}
