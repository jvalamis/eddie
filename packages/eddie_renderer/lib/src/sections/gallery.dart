import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

/// Gallery section widget
class GallerySection extends StatelessWidget {
  final List<String> items;

  const GallerySection({
    super.key,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    if (items.isEmpty) {
      return const SizedBox.shrink();
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth > 800 ? 3 : 
                              constraints.maxWidth > 600 ? 2 : 1;
        final spacing = 16.0;
        final itemWidth = (constraints.maxWidth - spacing * (crossAxisCount - 1)) / crossAxisCount;
        
        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: spacing,
            mainAxisSpacing: spacing,
            childAspectRatio: itemWidth / (itemWidth * 0.75), // 4:3 aspect ratio
          ),
          itemCount: items.length,
          itemBuilder: (context, index) {
            final imageUrl = items[index];
            
            return ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: CachedNetworkImage(
                imageUrl: imageUrl,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  color: theme.colorScheme.surfaceVariant,
                  child: Center(
                    child: CircularProgressIndicator(
                      color: theme.colorScheme.primary,
                    ),
                  ),
                ),
                errorWidget: (context, url, error) => Container(
                  color: theme.colorScheme.errorContainer,
                  child: Center(
                    child: Icon(
                      Icons.broken_image_outlined,
                      color: theme.colorScheme.onErrorContainer,
                    ),
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
}
