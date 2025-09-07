import 'package:flutter/material.dart';
import 'sections/heading.dart';
import 'sections/paragraph.dart';
import 'sections/image.dart';
import 'sections/gallery.dart';
import 'sections/list.dart';
import 'sections/quote.dart';
import 'sections/button.dart';
import 'sections/html.dart';

/// Universal section registry for Eddie
typedef SectionBuilder = Widget Function(BuildContext context, Map<String, dynamic> data);

final Map<String, SectionBuilder> kSectionRegistry = {
  'heading': (context, data) => HeadingSection(
    level: data['level'] ?? 2,
    text: data['text'] ?? '',
  ),
  'paragraph': (context, data) => ParagraphSection(
    text: data['text'] ?? '',
  ),
  'image': (context, data) => ImageSection(
    src: data['src'] as String?,
    alt: data['alt'] as String?,
    caption: data['caption'] as String?,
  ),
  'gallery': (context, data) => GallerySection(
    items: (data['items'] as List?)?.cast<String>() ?? [],
  ),
  'list': (context, data) => ListSection(
    items: (data['items'] as List?)?.cast<String>() ?? [],
  ),
  'quote': (context, data) => QuoteSection(
    text: data['text'] ?? '',
  ),
  'button': (context, data) => ButtonSection(
    text: data['text'] ?? 'Learn more',
    href: data['href'] as String?,
  ),
  'html': (context, data) => HtmlSection(
    html: data['text'] ?? '',
  ),
};

/// Build a section widget from section data
Widget buildSection(BuildContext context, String type, Map<String, dynamic> data) {
  final builder = kSectionRegistry[type];
  if (builder != null) {
    return builder(context, data);
  }
  
  // Fallback for unknown section types
  return Container(
    padding: const EdgeInsets.all(16),
    margin: const EdgeInsets.symmetric(vertical: 8),
    decoration: BoxDecoration(
      color: Theme.of(context).colorScheme.errorContainer.withOpacity(0.1),
      border: Border.all(
        color: Theme.of(context).colorScheme.error,
        width: 1,
      ),
      borderRadius: BorderRadius.circular(8),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Unknown section type: $type',
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            color: Theme.of(context).colorScheme.error,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Data: ${data.toString()}',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: Theme.of(context).colorScheme.onErrorContainer,
          ),
        ),
      ],
    ),
  );
}
