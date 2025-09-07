import 'package:flutter/material.dart';
import '../utils/responsive_layout.dart';
import '../models/website_data.dart';

/// Design Rule #3: Navigation by Size
/// Mobile: Bottom nav + top app bar
/// Tablet: Nav rail + app bar  
/// Desktop: Permanent side nav or rail + app bar
class AdaptiveNavigation extends StatelessWidget {
  final List<PageData> pages;
  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;
  final Widget body;

  const AdaptiveNavigation({
    super.key,
    required this.pages,
    required this.selectedIndex,
    required this.onDestinationSelected,
    required this.body,
  });

  @override
  Widget build(BuildContext context) {
    final navigationType = ResponsiveLayout.getNavigationType(context);
    
    switch (navigationType) {
      case NavigationType.bottomNav:
        return _buildBottomNavigation(context);
      case NavigationType.navRail:
        return _buildNavigationRail(context);
      case NavigationType.sideNav:
        return _buildSideNavigation(context);
    }
  }

  /// Mobile: Bottom navigation + top app bar
  Widget _buildBottomNavigation(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(pages.isNotEmpty ? pages[0].title : 'Website'),
        centerTitle: true,
      ),
      body: body,
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: onDestinationSelected,
        destinations: _buildDestinations(),
      ),
    );
  }

  /// Tablet: Navigation rail + app bar
  Widget _buildNavigationRail(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(pages.isNotEmpty ? pages[0].title : 'Website'),
        centerTitle: true,
      ),
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: selectedIndex,
            onDestinationSelected: onDestinationSelected,
            labelType: NavigationRailLabelType.all,
            destinations: _buildRailDestinations(),
          ),
          const VerticalDivider(thickness: 1, width: 1),
          Expanded(child: body),
        ],
      ),
    );
  }

  /// Desktop: Permanent side navigation
  Widget _buildSideNavigation(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          NavigationDrawer(
            selectedIndex: selectedIndex,
            onDestinationSelected: onDestinationSelected,
            children: [
              DrawerHeader(
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Icon(
                      Icons.web,
                      size: 48,
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      pages.isNotEmpty ? pages[0].title : 'Website',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                      ),
                    ),
                  ],
                ),
              ),
              ..._buildDrawerDestinations(),
            ],
          ),
          const VerticalDivider(thickness: 1, width: 1),
          Expanded(child: body),
        ],
      ),
    );
  }

  List<NavigationDestination> _buildDestinations() {
    return pages.take(5).map((page) {
      return NavigationDestination(
        icon: _getIconForPage(page),
        selectedIcon: _getSelectedIconForPage(page),
        label: _getShortLabel(page.title),
      );
    }).toList();
  }

  List<NavigationRailDestination> _buildRailDestinations() {
    return pages.take(8).map((page) {
      return NavigationRailDestination(
        icon: _getIconForPage(page),
        selectedIcon: _getSelectedIconForPage(page),
        label: Text(_getShortLabel(page.title)),
      );
    }).toList();
  }

  List<Widget> _buildDrawerDestinations() {
    return pages.map((page) {
      final isSelected = pages.indexOf(page) == selectedIndex;
      return ListTile(
        leading: _getIconForPage(page),
        title: Text(page.title),
        selected: isSelected,
        onTap: () => onDestinationSelected(pages.indexOf(page)),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      );
    }).toList();
  }

  Widget _getIconForPage(PageData page) {
    // Map page titles to appropriate icons
    final title = page.title.toLowerCase();
    if (title.contains('home') || title.contains('main')) {
      return const Icon(Icons.home_outlined);
    } else if (title.contains('about')) {
      return const Icon(Icons.info_outlined);
    } else if (title.contains('contact')) {
      return const Icon(Icons.contact_mail_outlined);
    } else if (title.contains('program') || title.contains('service')) {
      return const Icon(Icons.work_outline);
    } else if (title.contains('event')) {
      return const Icon(Icons.event_outlined);
    } else if (title.contains('gallery') || title.contains('image')) {
      return const Icon(Icons.photo_library_outlined);
    } else if (title.contains('news') || title.contains('blog')) {
      return const Icon(Icons.article_outlined);
    } else if (title.contains('member')) {
      return const Icon(Icons.people_outline);
    } else if (title.contains('support') || title.contains('donate')) {
      return const Icon(Icons.favorite_outline);
    } else {
      return const Icon(Icons.web_outlined);
    }
  }

  Widget _getSelectedIconForPage(PageData page) {
    // Map page titles to appropriate selected icons
    final title = page.title.toLowerCase();
    if (title.contains('home') || title.contains('main')) {
      return const Icon(Icons.home);
    } else if (title.contains('about')) {
      return const Icon(Icons.info);
    } else if (title.contains('contact')) {
      return const Icon(Icons.contact_mail);
    } else if (title.contains('program') || title.contains('service')) {
      return const Icon(Icons.work);
    } else if (title.contains('event')) {
      return const Icon(Icons.event);
    } else if (title.contains('gallery') || title.contains('image')) {
      return const Icon(Icons.photo_library);
    } else if (title.contains('news') || title.contains('blog')) {
      return const Icon(Icons.article);
    } else if (title.contains('member')) {
      return const Icon(Icons.people);
    } else if (title.contains('support') || title.contains('donate')) {
      return const Icon(Icons.favorite);
    } else {
      return const Icon(Icons.web);
    }
  }

  String _getShortLabel(String title) {
    // Truncate long titles for navigation
    if (title.length <= 12) return title;
    return '${title.substring(0, 9)}...';
  }
}
