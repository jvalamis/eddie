import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'eddie_doc.dart';
import 'section_registry.dart';

/// Universal page renderer for Eddie
class EddiePage extends StatelessWidget {
  final PageDoc page;

  const EddiePage({
    super.key,
    required this.page,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero section
          if (page.hero != null) _buildHeroSection(context),
          
          // Content sections
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: page.sections.map((section) => 
                buildSection(context, section.type, section.data)
              ).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroSection(BuildContext context) {
    final hero = page.hero!;
    final theme = Theme.of(context);
    
    return Container(
      height: 400,
      width: double.infinity,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Hero image or gradient
          if (hero.image != null && hero.image!.isNotEmpty)
            CachedNetworkImage(
              imageUrl: hero.image!,
              fit: BoxFit.cover,
              placeholder: (context, url) => _buildGradientBackground(theme),
              errorWidget: (context, url, error) => _buildGradientBackground(theme),
            )
          else
            _buildGradientBackground(theme),
          
          // Dark overlay
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  Colors.black.withOpacity(0.3),
                  Colors.black.withOpacity(0.7),
                ],
                stops: const [0.0, 0.5, 1.0],
              ),
            ),
          ),
          
          // Hero content
          Positioned(
            bottom: 32,
            left: 24,
            right: 24,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (hero.title != null && hero.title!.isNotEmpty)
                  Text(
                    hero.title!,
                    style: theme.textTheme.displayMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      shadows: [
                        Shadow(
                          offset: const Offset(0, 2),
                          blurRadius: 4,
                          color: Colors.black.withOpacity(0.5),
                        ),
                      ],
                    ),
                  ),
                if (hero.subtitle != null && hero.subtitle!.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Text(
                    hero.subtitle!,
                    style: theme.textTheme.titleLarge?.copyWith(
                      color: Colors.white.withOpacity(0.9),
                      shadows: [
                        Shadow(
                          offset: const Offset(0, 1),
                          blurRadius: 2,
                          color: Colors.black.withOpacity(0.5),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGradientBackground(ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            theme.colorScheme.primary,
            theme.colorScheme.secondary,
            theme.colorScheme.tertiary,
          ],
        ),
      ),
    );
  }
}
