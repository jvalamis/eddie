import 'package:flutter/material.dart';
import '../models/website_data.dart';
import '../services/data_service.dart';
import '../widgets/adaptive_navigation.dart';
import '../widgets/responsive_image.dart';
import '../utils/responsive_layout.dart';
import 'page_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  WebsiteData? _websiteData;
  bool _isLoading = true;
  String? _error;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final data = await DataService.loadWebsiteData();
      setState(() {
        _websiteData = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return _buildLoadingState();
    }

    if (_error != null) {
      return _buildErrorState();
    }

    if (_websiteData == null) {
      return _buildEmptyState();
    }

    return AdaptiveNavigation(
      pages: _websiteData!.pages,
      selectedIndex: _selectedIndex,
      onDestinationSelected: (index) {
        setState(() {
          _selectedIndex = index;
        });
      },
      body: _buildBody(),
    );
  }

  Widget _buildLoadingState() {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(),
            SizedBox(height: ResponsiveLayout.spacing16),
            Text(
              'Loading content...',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: EdgeInsets.all(ResponsiveLayout.spacing24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: Theme.of(context).colorScheme.error,
              ),
              SizedBox(height: ResponsiveLayout.spacing16),
              Text(
                'Error loading data',
                style: Theme.of(context).textTheme.headlineSmall,
                textAlign: TextAlign.center,
              ),
              SizedBox(height: ResponsiveLayout.spacing8),
              Text(
                _error!,
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              SizedBox(height: ResponsiveLayout.spacing24),
              ElevatedButton.icon(
                onPressed: _loadData,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.inbox_outlined,
              size: 64,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
            SizedBox(height: ResponsiveLayout.spacing16),
            Text(
              'No content available',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBody() {
    return SingleChildScrollView(
      child: Column(
        children: [
          // Design Rule #7: Images as First-Class Content - Hero Section
          _buildHeroSection(),
          // Main content with proper spacing
          Padding(
            padding: EdgeInsets.all(ResponsiveLayout.spacing16),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: ResponsiveLayout.maxContentWidth,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(),
                  SizedBox(height: ResponsiveLayout.spacing32),
                  _buildContentPreview(),
                  SizedBox(height: ResponsiveLayout.spacing32),
                  _buildPagesGrid(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Design Rule #7: Images as First-Class Content - Hero Section
  Widget _buildHeroSection() {
    // Find the best hero image from the first page or any page
    String? heroImageUrl;
    String? heroImageAlt;
    
    for (final page in _websiteData!.pages) {
      if (page.content.images.isNotEmpty) {
        heroImageUrl = page.content.images.first.src;
        heroImageAlt = page.content.images.first.alt;
        break;
      }
    }

    return Container(
      height: 500,
      width: double.infinity,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Hero image with gradient overlay
          if (heroImageUrl != null)
            ResponsiveImage(
              imageUrl: heroImageUrl,
              altText: heroImageAlt ?? '',
              fit: BoxFit.cover,
            )
          else
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Theme.of(context).colorScheme.primary,
                    Theme.of(context).colorScheme.secondary,
                    Theme.of(context).colorScheme.tertiary,
                  ],
                ),
              ),
            ),
          
          // Dark overlay for text readability
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  Colors.black.withOpacity(0.3),
                  Colors.black.withOpacity(0.8),
                ],
                stops: const [0.0, 0.5, 1.0],
              ),
            ),
          ),
          
          // Hero content
          Positioned(
            bottom: ResponsiveLayout.spacing32,
            left: ResponsiveLayout.spacing16,
            right: ResponsiveLayout.spacing16,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Domain badge
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: ResponsiveLayout.spacing12,
                    vertical: ResponsiveLayout.spacing6,
                  ),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary.withOpacity(0.9),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _websiteData!.domain,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
                SizedBox(height: ResponsiveLayout.spacing16),
                
                // Main title
                Text(
                  _websiteData!.title,
                  style: Theme.of(context).textTheme.displayMedium?.copyWith(
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
                if (_websiteData!.description.isNotEmpty) ...[
                  SizedBox(height: ResponsiveLayout.spacing12),
                  Text(
                    _websiteData!.description,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: Colors.white.withOpacity(0.9),
                          shadows: [
                            Shadow(
                              offset: const Offset(0, 1),
                              blurRadius: 2,
                              color: Colors.black.withOpacity(0.5),
                            ),
                          ],
                        ),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                
                // Stats row
                SizedBox(height: ResponsiveLayout.spacing16),
                Row(
                  children: [
                    _buildHeroStat('${_websiteData!.pages.length}', 'Pages'),
                    SizedBox(width: ResponsiveLayout.spacing16),
                    _buildHeroStat('${_websiteData!.pages.fold(0, (sum, page) => sum + page.content.images.length)}', 'Images'),
                    SizedBox(width: ResponsiveLayout.spacing16),
                    _buildHeroStat('${_websiteData!.pages.fold(0, (sum, page) => sum + page.content.links.length)}', 'Links'),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroStat(String value, String label) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: ResponsiveLayout.spacing12,
        vertical: ResponsiveLayout.spacing8,
      ),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.white.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
          ),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.white.withOpacity(0.8),
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Design Rule #4: Typography That Sells the Message
        Text(
          'About ${_websiteData!.domain}',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.primary,
              ),
        ),
        SizedBox(height: ResponsiveLayout.spacing16),
        
        // Enhanced description with better typography
        if (_websiteData!.description.isNotEmpty) ...[
          Text(
            _websiteData!.description,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                  height: 1.6, // Design Rule #4: body LH ~1.4–1.6
                ),
          ),
          SizedBox(height: ResponsiveLayout.spacing16),
        ],
        
        // Enhanced keywords with better styling
        if (_websiteData!.keywords.isNotEmpty) ...[
          Text(
            'Key Topics',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          SizedBox(height: ResponsiveLayout.spacing8),
          Wrap(
            spacing: ResponsiveLayout.spacing8,
            runSpacing: ResponsiveLayout.spacing8,
            children: _websiteData!.keywords
                .split(',')
                .where((keyword) => keyword.trim().isNotEmpty)
                .map((keyword) => Chip(
                      label: Text(
                        keyword.trim(),
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                      ),
                      visualDensity: VisualDensity.compact,
                      backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
                      labelStyle: TextStyle(
                        color: Theme.of(context).colorScheme.onSecondaryContainer,
                      ),
                    ))
                .toList(),
          ),
        ],
      ],
    );
  }

  Widget _buildContentPreview() {
    final totalImages = _websiteData!.pages
        .fold(0, (sum, page) => sum + page.content.images.length);
    final totalLinks = _websiteData!.pages
        .fold(0, (sum, page) => sum + page.content.links.length);
    final totalHeadings = _websiteData!.pages
        .fold(0, (sum, page) => sum + page.content.headings.length);
    final totalParagraphs = _websiteData!.pages
        .fold(0, (sum, page) => sum + page.content.paragraphs.length);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              Icons.analytics_outlined,
              color: Theme.of(context).colorScheme.primary,
              size: 28,
            ),
            SizedBox(width: ResponsiveLayout.spacing8),
            Text(
              'Content Overview',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary,
                  ),
            ),
          ],
        ),
        SizedBox(height: ResponsiveLayout.spacing16),
        
        // Design Rule #6: Components & shape language - Enhanced cards
        LayoutBuilder(
          builder: (context, constraints) {
            final isWide = constraints.maxWidth > 600;
            return isWide 
              ? _buildWideStatsGrid(totalImages, totalLinks, totalHeadings, totalParagraphs)
              : _buildNarrowStatsGrid(totalImages, totalLinks, totalHeadings, totalParagraphs);
          },
        ),
      ],
    );
  }

  Widget _buildWideStatsGrid(int totalImages, int totalLinks, int totalHeadings, int totalParagraphs) {
    return Row(
      children: [
        Expanded(
          child: _buildEnhancedStatCard(
            icon: Icons.pages_outlined,
            label: 'Pages',
            value: _websiteData!.pages.length.toString(),
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        SizedBox(width: ResponsiveLayout.spacing16),
        Expanded(
          child: _buildEnhancedStatCard(
            icon: Icons.image_outlined,
            label: 'Images',
            value: totalImages.toString(),
            color: Theme.of(context).colorScheme.secondary,
          ),
        ),
        SizedBox(width: ResponsiveLayout.spacing16),
        Expanded(
          child: _buildEnhancedStatCard(
            icon: Icons.link_outlined,
            label: 'Links',
            value: totalLinks.toString(),
            color: Theme.of(context).colorScheme.tertiary,
          ),
        ),
        SizedBox(width: ResponsiveLayout.spacing16),
        Expanded(
          child: _buildEnhancedStatCard(
            icon: Icons.text_fields_outlined,
            label: 'Content',
            value: '${totalHeadings + totalParagraphs}',
            color: Theme.of(context).colorScheme.primaryContainer,
          ),
        ),
      ],
    );
  }

  Widget _buildNarrowStatsGrid(int totalImages, int totalLinks, int totalHeadings, int totalParagraphs) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildEnhancedStatCard(
                icon: Icons.pages_outlined,
                label: 'Pages',
                value: _websiteData!.pages.length.toString(),
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            SizedBox(width: ResponsiveLayout.spacing16),
            Expanded(
              child: _buildEnhancedStatCard(
                icon: Icons.image_outlined,
                label: 'Images',
                value: totalImages.toString(),
                color: Theme.of(context).colorScheme.secondary,
              ),
            ),
          ],
        ),
        SizedBox(height: ResponsiveLayout.spacing16),
        Row(
          children: [
            Expanded(
              child: _buildEnhancedStatCard(
                icon: Icons.link_outlined,
                label: 'Links',
                value: totalLinks.toString(),
                color: Theme.of(context).colorScheme.tertiary,
              ),
            ),
            SizedBox(width: ResponsiveLayout.spacing16),
            Expanded(
              child: _buildEnhancedStatCard(
                icon: Icons.text_fields_outlined,
                label: 'Content',
                value: '${totalHeadings + totalParagraphs}',
                color: Theme.of(context).colorScheme.primaryContainer,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildEnhancedStatCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Card(
      elevation: 2,
      child: Container(
        padding: EdgeInsets.all(ResponsiveLayout.spacing16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              color.withOpacity(0.1),
              color.withOpacity(0.05),
            ],
          ),
        ),
        child: Column(
          children: [
            Container(
              padding: EdgeInsets.all(ResponsiveLayout.spacing12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                size: 32,
                color: color,
              ),
            ),
            SizedBox(height: ResponsiveLayout.spacing12),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
            ),
            SizedBox(height: ResponsiveLayout.spacing4),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w500,
                  ),
            ),
          ],
        ),
      ),
    );
  }


  Widget _buildPagesGrid() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              Icons.explore_outlined,
              color: Theme.of(context).colorScheme.primary,
              size: 28,
            ),
            SizedBox(width: ResponsiveLayout.spacing8),
            Expanded(
              child: Text(
                'Explore Pages',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.primary,
                    ),
              ),
            ),
            Container(
              padding: EdgeInsets.symmetric(
                horizontal: ResponsiveLayout.spacing12,
                vertical: ResponsiveLayout.spacing6,
              ),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                '${_websiteData!.pages.length} pages',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ),
          ],
        ),
        SizedBox(height: ResponsiveLayout.spacing16),
        LayoutBuilder(
          builder: (context, constraints) {
            final crossAxisCount = ResponsiveLayout.getCrossAxisCount(context);
            return GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: crossAxisCount,
                childAspectRatio: 0.8, // Better aspect ratio for content
                crossAxisSpacing: ResponsiveLayout.spacing16,
                mainAxisSpacing: ResponsiveLayout.spacing16,
              ),
              itemCount: _websiteData!.pages.length,
              itemBuilder: (context, index) {
                final page = _websiteData!.pages[index];
                return _buildEnhancedPageCard(page, index);
              },
            );
          },
        ),
      ],
    );
  }

  Widget _buildEnhancedPageCard(PageData page, int index) {
    final hasImage = page.content.images.isNotEmpty;
    final hasContent = page.content.headings.isNotEmpty || page.content.paragraphs.isNotEmpty;
    
    return Card(
      elevation: 3,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => _navigateToPage(page),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            gradient: hasImage 
              ? null 
              : LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Theme.of(context).colorScheme.primaryContainer.withOpacity(0.1),
                    Theme.of(context).colorScheme.secondaryContainer.withOpacity(0.1),
                  ],
                ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero image or placeholder
              if (hasImage)
                Expanded(
                  flex: 3,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      ResponsiveImage(
                        imageUrl: page.content.images.first.src,
                        altText: page.content.images.first.alt,
                        fit: BoxFit.cover,
                      ),
                      // Gradient overlay for text readability
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              Colors.black.withOpacity(0.3),
                            ],
                          ),
                        ),
                      ),
                      // Page number badge
                      Positioned(
                        top: ResponsiveLayout.spacing8,
                        right: ResponsiveLayout.spacing8,
                        child: Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: ResponsiveLayout.spacing8,
                            vertical: ResponsiveLayout.spacing4,
                          ),
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.primary,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${index + 1}',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: Theme.of(context).colorScheme.onPrimary,
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                        ),
                      ),
                    ],
                  ),
                )
              else
                Expanded(
                  flex: 2,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Theme.of(context).colorScheme.primary.withOpacity(0.1),
                          Theme.of(context).colorScheme.secondary.withOpacity(0.1),
                        ],
                      ),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.article_outlined,
                            size: 48,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          SizedBox(height: ResponsiveLayout.spacing8),
                          Text(
                            'Page ${index + 1}',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Theme.of(context).colorScheme.primary,
                                  fontWeight: FontWeight.w500,
                                ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              
              // Content section
              Expanded(
                flex: 2,
                child: Padding(
                  padding: EdgeInsets.all(ResponsiveLayout.spacing16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Title
                      Text(
                        page.title,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: hasImage 
                                ? Colors.white 
                                : Theme.of(context).colorScheme.onSurface,
                            ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: ResponsiveLayout.spacing8),
                      
                      // Description
                      if (page.description.isNotEmpty) ...[
                        Expanded(
                          child: Text(
                            page.description,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: hasImage 
                                    ? Colors.white.withOpacity(0.9)
                                    : Theme.of(context).colorScheme.onSurfaceVariant,
                                  height: 1.4,
                                ),
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                      
                      // Content stats
                      if (hasContent) ...[
                        SizedBox(height: ResponsiveLayout.spacing8),
                        Row(
                          children: [
                            Icon(
                              Icons.text_fields_outlined,
                              size: 16,
                              color: hasImage 
                                ? Colors.white.withOpacity(0.7)
                                : Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                            SizedBox(width: ResponsiveLayout.spacing4),
                            Text(
                              '${page.content.headings.length + page.content.paragraphs.length} items',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: hasImage 
                                      ? Colors.white.withOpacity(0.7)
                                      : Theme.of(context).colorScheme.onSurfaceVariant,
                                  ),
                            ),
                            if (page.content.images.length > 1) ...[
                              SizedBox(width: ResponsiveLayout.spacing8),
                              Icon(
                                Icons.image_outlined,
                                size: 16,
                                color: hasImage 
                                  ? Colors.white.withOpacity(0.7)
                                  : Theme.of(context).colorScheme.onSurfaceVariant,
                              ),
                              SizedBox(width: ResponsiveLayout.spacing4),
                              Text(
                                '${page.content.images.length}',
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: hasImage 
                                        ? Colors.white.withOpacity(0.7)
                                        : Theme.of(context).colorScheme.onSurfaceVariant,
                                    ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _navigateToPage(PageData page) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => PageDetailScreen(page: page),
      ),
    );
  }
}