import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';

/// HTML section widget (rendered as Markdown)
class HtmlSection extends StatelessWidget {
  final String html;

  const HtmlSection({
    super.key,
    required this.html,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceVariant.withOpacity(0.3),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: theme.colorScheme.outline.withOpacity(0.2),
        ),
      ),
      child: MarkdownBody(
        data: html,
        styleSheet: MarkdownStyleSheet(
          p: theme.textTheme.bodyLarge?.copyWith(height: 1.6),
          h1: theme.textTheme.headlineLarge,
          h2: theme.textTheme.headlineMedium,
          h3: theme.textTheme.headlineSmall,
          h4: theme.textTheme.titleLarge,
          h5: theme.textTheme.titleMedium,
          h6: theme.textTheme.titleSmall,
          a: theme.textTheme.bodyLarge?.copyWith(
            color: theme.colorScheme.primary,
            decoration: TextDecoration.underline,
          ),
          code: theme.textTheme.bodyMedium?.copyWith(
            fontFamily: 'monospace',
            backgroundColor: theme.colorScheme.surfaceVariant,
          ),
          codeblockDecoration: BoxDecoration(
            color: theme.colorScheme.surfaceVariant,
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
    );
  }
}
