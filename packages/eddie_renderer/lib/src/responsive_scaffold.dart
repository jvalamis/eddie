import 'package:flutter/material.dart';
import 'eddie_doc.dart';

/// Responsive scaffold that adapts to screen size
class ResponsiveScaffold extends StatelessWidget {
  final EddieDoc doc;
  final int currentIndex;
  final Widget child;

  const ResponsiveScaffold({
    super.key,
    required this.doc,
    required this.currentIndex,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 1200) {
          return _buildDesktopLayout(context);
        } else if (constraints.maxWidth > 600) {
          return _buildTabletLayout(context);
        } else {
          return _buildMobileLayout(context);
        }
      },
    );
  }

  Widget _buildDesktopLayout(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // Navigation Rail
          NavigationRail(
            selectedIndex: currentIndex,
            onDestinationSelected: (index) => _navigateToPage(context, index),
            labelType: NavigationRailLabelType.all,
            destinations: doc.nav.map((item) => NavigationRailDestination(
              icon: const Icon(Icons.article_outlined),
              selectedIcon: const Icon(Icons.article),
              label: Text(item.title),
            )).toList(),
          ),
          const VerticalDivider(thickness: 1, width: 1),
          // Main content
          Expanded(
            child: _buildContent(context),
          ),
        ],
      ),
    );
  }

  Widget _buildTabletLayout(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // Compact Navigation Rail
          NavigationRail(
            selectedIndex: currentIndex,
            onDestinationSelected: (index) => _navigateToPage(context, index),
            labelType: NavigationRailLabelType.none,
            destinations: doc.nav.map((item) => NavigationRailDestination(
              icon: const Icon(Icons.article_outlined),
              selectedIcon: const Icon(Icons.article),
              label: Text(item.title),
            )).toList(),
          ),
          const VerticalDivider(thickness: 1, width: 1),
          // Main content
          Expanded(
            child: _buildContent(context),
          ),
        ],
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(doc.site.title),
        actions: [
          IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () => Scaffold.of(context).openEndDrawer(),
          ),
        ],
      ),
      endDrawer: Drawer(
        child: Column(
          children: [
            DrawerHeader(
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primaryContainer,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    doc.site.title,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                    ),
                  ),
                  if (doc.site.description != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      doc.site.description!,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Expanded(
              child: ListView(
                children: doc.nav.asMap().entries.map((entry) {
                  final index = entry.key;
                  final item = entry.value;
                  return ListTile(
                    selected: index == currentIndex,
                    leading: Icon(
                      index == currentIndex ? Icons.article : Icons.article_outlined,
                    ),
                    title: Text(item.title),
                    onTap: () {
                      Navigator.of(context).pop();
                      _navigateToPage(context, index);
                    },
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
      body: _buildContent(context),
    );
  }

  Widget _buildContent(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxWidth: 1200),
      child: child,
    );
  }

  void _navigateToPage(BuildContext context, int index) {
    // This would be handled by the routing system
    // For now, we'll just update the current page
    // In a real app, you'd use go_router or similar
  }
}
