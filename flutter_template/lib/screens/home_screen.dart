import 'package:flutter/material.dart';
import '../models/website_data.dart';
import '../services/data_service.dart';
import '../widgets/modern_app_bar.dart';
import '../widgets/navigation_drawer.dart' as custom;
import '../widgets/page_card.dart';
import '../widgets/stats_card.dart';
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
    return Scaffold(
      appBar: const ModernAppBar(title: 'Website App'),
      drawer: _websiteData != null ? custom.CustomNavigationDrawer(websiteData: _websiteData!) : null,
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Loading website data...'),
          ],
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Error loading data',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              _error!,
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadData,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_websiteData == null) {
      return const Center(
        child: Text('No data available'),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: CustomScrollView(
        slivers: [
          // Stats Section
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Website Overview',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: StatsCard(
                          title: 'Pages',
                          value: _websiteData!.pages.length.toString(),
                          icon: Icons.pages,
                          color: Colors.blue,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: StatsCard(
                          title: 'Assets',
                          value: _websiteData!.assets.length.toString(),
                          icon: Icons.image,
                          color: Colors.green,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.language, color: Colors.blue),
                              const SizedBox(width: 8),
                              Text(
                                'Original Website',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _websiteData!.originalUrl,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.blue,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Domain: ${_websiteData!.domain}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          Text(
                            'Crawled: ${_formatDate(_websiteData!.crawledAt)}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Pages Section
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'Pages (${_websiteData!.pages.length})',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
            ),
          ),
          
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final page = _websiteData!.pages[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: PageCard(
                      page: page,
                      onTap: () => _navigateToPage(page),
                    ),
                  );
                },
                childCount: _websiteData!.pages.length,
              ),
            ),
          ),
        ],
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

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year} at ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}
