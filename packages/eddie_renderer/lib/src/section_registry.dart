import 'package:flutter/material.dart';
import 'sections/heading.dart';
import 'sections/paragraph.dart';
import 'sections/image.dart';
import 'sections/gallery.dart';
import 'sections/list.dart';
import 'sections/quote.dart';
import 'sections/button.dart';
import 'sections/html.dart';

/// Registry that maps section types to their corresponding widgets
class SectionRegistry {
  static final Map<String, Widget Function(Map<String, dynamic>)> _registry = {
    'heading': (data) => HeadingSection(
      level: data['level'] ?? 1,
      text: data['text'] ?? '',
    ),
    'paragraph': (data) => ParagraphSection(
      text: data['text'] ?? '',
    ),
    'image': (data) => ImageSection(
      src: data['src'] ?? '',
      alt: data['alt'] ?? '',
      caption: data['caption'],
    ),
    'gallery': (data) => GallerySection(
      items: List<String>.from(data['items'] ?? []),
    ),
    'list': (data) => ListSection(
      items: List<String>.from(data['items'] ?? []),
    ),
    'quote': (data) => QuoteSection(
      text: data['text'] ?? '',
    ),
    'button': (data) => ButtonSection(
      text: data['text'] ?? '',
      href: data['href'],
    ),
    'html': (data) => HtmlSection(
      html: data['html'] ?? '',
    ),
  };

  /// Get a widget for a section type
  static Widget? buildSection(String type, Map<String, dynamic> data) {
    final builder = _registry[type];
    if (builder == null) {
      debugPrint('Unknown section type: $type');
      return null;
    }
    
    try {
      return builder(data);
    } catch (e) {
      debugPrint('Error building section $type: $e');
      return null;
    }
  }

  /// Get all supported section types
  static List<String> get supportedTypes => _registry.keys.toList();

  /// Check if a section type is supported
  static bool isSupported(String type) => _registry.containsKey(type);

  /// Register a custom section type
  static void register(String type, Widget Function(Map<String, dynamic>) builder) {
    _registry[type] = builder;
  }

  /// Unregister a section type
  static void unregister(String type) {
    _registry.remove(type);
  }
}