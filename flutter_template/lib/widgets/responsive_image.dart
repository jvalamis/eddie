import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../utils/responsive_layout.dart';

/// Design Rule #7: Images as First-Class Content
/// Optimize to WebP/AVIF; responsive sizes; lazy-load
/// Preserve alt text/captions; support dark overlays for legibility
class ResponsiveImage extends StatelessWidget {
  final String imageUrl;
  final String? altText;
  final String? caption;
  final double? width;
  final double? height;
  final BoxFit fit;
  final bool showCaption;
  final bool enableDarkOverlay;
  final BorderRadius? borderRadius;
  final VoidCallback? onTap;

  const ResponsiveImage({
    super.key,
    required this.imageUrl,
    this.altText,
    this.caption,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.showCaption = true,
    this.enableDarkOverlay = false,
    this.borderRadius,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final defaultBorderRadius = BorderRadius.circular(16); // Design Rule #6: 12-16px corners
    
    Widget imageWidget = CachedNetworkImage(
      imageUrl: imageUrl,
      width: width,
      height: height,
      fit: fit,
      placeholder: (context, url) => _buildSkeletonLoader(context),
      errorWidget: (context, url, error) => _buildErrorWidget(context),
      // Design Rule #9: Performance - cache images
      memCacheWidth: width?.toInt(),
      memCacheHeight: height?.toInt(),
    );

    // Add dark overlay if enabled (for text legibility)
    if (enableDarkOverlay) {
      imageWidget = Stack(
        children: [
          imageWidget,
          Container(
            decoration: BoxDecoration(
              borderRadius: borderRadius ?? defaultBorderRadius,
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  Colors.black.withOpacity(0.7),
                ],
              ),
            ),
          ),
        ],
      );
    }

    // Add border radius
    imageWidget = ClipRRect(
      borderRadius: borderRadius ?? defaultBorderRadius,
      child: imageWidget,
    );

    // Make tappable if onTap is provided
    if (onTap != null) {
      imageWidget = InkWell(
        onTap: onTap,
        borderRadius: borderRadius ?? defaultBorderRadius,
        child: imageWidget,
      );
    }

    // Wrap in card if caption is provided
    if (showCaption && (caption != null || altText != null)) {
      return Card(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            imageWidget,
            if (caption != null || altText != null) ...[
              Padding(
                padding: const EdgeInsets.all(ResponsiveLayout.spacing12),
                child: Text(
                  caption ?? altText ?? '',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ),
            ],
          ],
        ),
      );
    }

    return imageWidget;
  }

  /// Design Rule #10: Skeleton loaders for loading states
  Widget _buildSkeletonLoader(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceVariant,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Center(
        child: CircularProgressIndicator(
          strokeWidth: 2,
          color: theme.colorScheme.primary,
        ),
      ),
    );
  }

  /// Design Rule #10: Friendly error states
  Widget _buildErrorWidget(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: theme.colorScheme.errorContainer,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.broken_image_outlined,
            color: theme.colorScheme.onErrorContainer,
            size: 32,
          ),
          const SizedBox(height: 8),
          Text(
            'Image unavailable',
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onErrorContainer,
            ),
          ),
        ],
      ),
    );
  }
}

/// Hero image component for prominent content
class HeroImage extends StatelessWidget {
  final String imageUrl;
  final String? title;
  final String? subtitle;
  final VoidCallback? onTap;

  const HeroImage({
    super.key,
    required this.imageUrl,
    this.title,
    this.subtitle,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final screenHeight = MediaQuery.of(context).size.height;
    final heroHeight = (screenHeight * 0.4).clamp(200.0, 400.0);

    return Stack(
      children: [
        ResponsiveImage(
          imageUrl: imageUrl,
          height: heroHeight,
          fit: BoxFit.cover,
          enableDarkOverlay: title != null || subtitle != null,
          onTap: onTap,
        ),
        if (title != null || subtitle != null)
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Padding(
              padding: const EdgeInsets.all(ResponsiveLayout.spacing24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (title != null)
                    Text(
                      title!,
                      style: theme.textTheme.headlineMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      subtitle!,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
      ],
    );
  }
}

/// Image gallery component for multiple images
class ImageGallery extends StatelessWidget {
  final List<String> imageUrls;
  final List<String>? captions;
  final int? maxImages;
  final VoidCallback? onViewAll;

  const ImageGallery({
    super.key,
    required this.imageUrls,
    this.captions,
    this.maxImages = 6,
    this.onViewAll,
  });

  @override
  Widget build(BuildContext context) {
    final displayImages = imageUrls.take(maxImages ?? imageUrls.length).toList();
    final displayCaptions = captions?.take(displayImages.length).toList();

    return ResponsiveGrid(
      children: displayImages.asMap().entries.map((entry) {
        final index = entry.key;
        final imageUrl = entry.value;
        final caption = displayCaptions?[index];

        return ResponsiveImage(
          imageUrl: imageUrl,
          caption: caption,
          height: 200,
          fit: BoxFit.cover,
        );
      }).toList(),
    );
  }
}
