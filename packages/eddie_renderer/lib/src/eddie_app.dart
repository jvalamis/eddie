import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'eddie_doc.dart';
import 'eddie_page.dart';
import 'responsive_scaffold.dart';
import 'theme.dart';

/// Universal Eddie app that loads content from JSON
class EddieApp extends StatefulWidget {
  const EddieApp({super.key});

  @override
  State<EddieApp> createState() => _EddieAppState();
}

class _EddieAppState extends State<EddieApp> {
  EddieDoc? _doc;
  bool _isLoading = true;
  String? _error;
  int _currentPageIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadContent();
  }

  Future<void> _loadContent() async {
    try {
      final doc = await _loadEddieDoc();
      setState(() {
        _doc = doc;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<EddieDoc> _loadEddieDoc() async {
    // 1) Try to load from URL parameter ?data=...
    final queryParams = Uri.base.queryParameters;
    if (queryParams.containsKey('data')) {
      final dataUrl = queryParams['data']!;
      final resolvedUrl = Uri.base.resolve(dataUrl);
      
      // For now, we'll use a simple HTTP request
      // In a real app, you'd use the http package
      throw UnimplementedError('URL loading not implemented yet');
    }
    
    // 2) Load from web root using HTTP
    try {
      print('Loading content.json from web root...');
      final url = Uri.base.resolve('content.json');
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body) as Map<String, dynamic>;
        print('Successfully loaded content.json from web root');
        return EddieDoc.fromJson(jsonData);
      } else {
        throw Exception('Failed to load content.json: ${response.statusCode}');
      }
    } catch (e) {
      print('Failed to load content.json: $e');
      // 3) Fallback to default content
      return _createFallbackDoc();
    }
  }

  EddieDoc _createFallbackDoc() {
    return EddieDoc(
      version: '1.0',
      site: Site(
        title: 'Eddie App',
        description: 'Universal content renderer',
        brandSeed: '#5F6FFF',
      ),
      nav: [
        NavItem(title: 'Home', slug: 'home'),
      ],
      pages: [
        PageDoc(
          slug: 'home',
          title: 'Welcome to Eddie',
          hero: EddieHero(
            title: 'Welcome to Eddie',
            subtitle: 'Universal content renderer for any website',
          ),
          sections: [
            Section('heading', {'level': 2, 'text': 'About Eddie'}),
            Section('paragraph', {'text': 'Eddie is a universal content renderer that can transform any website into a beautiful, modern Flutter app. It uses a canonical JSON schema to ensure consistency across all sites.'}),
            Section('heading', {'level': 3, 'text': 'Features'}),
            Section('list', {'items': [
              'Universal content schema',
              'Responsive design',
              'Material 3 theming',
              'Automatic brand detection',
              'Cross-platform support'
            ]}),
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return MaterialApp(
        title: 'Eddie App',
        theme: EddieTheme.light(EddieTheme.defaultSeed),
        home: const Scaffold(
          body: Center(
            child: CircularProgressIndicator(),
          ),
        ),
      );
    }

    if (_error != null) {
      return MaterialApp(
        title: 'Eddie App',
        theme: EddieTheme.light(EddieTheme.defaultSeed),
        home: Scaffold(
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline,
                  size: 64,
                  color: Theme.of(context).colorScheme.error,
                ),
                const SizedBox(height: 16),
                Text(
                  'Failed to load content',
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
                  onPressed: () {
                    setState(() {
                      _isLoading = true;
                      _error = null;
                    });
                    _loadContent();
                  },
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (_doc == null) {
      return MaterialApp(
        title: 'Eddie App',
        theme: EddieTheme.light(EddieTheme.defaultSeed),
        home: const Scaffold(
          body: Center(
            child: Text('No content available'),
          ),
        ),
      );
    }

    // Parse brand seed color
    Color seedColor = EddieTheme.defaultSeed;
    if (_doc!.site.brandSeed != null) {
      try {
        final hex = _doc!.site.brandSeed!.replaceFirst('#', '');
        seedColor = Color(int.parse('FF$hex', radix: 16));
      } catch (e) {
        // Use default if parsing fails
      }
    }

    return MaterialApp(
      title: _doc!.site.title,
      theme: EddieTheme.light(seedColor),
      darkTheme: EddieTheme.dark(seedColor),
      themeMode: ThemeMode.system,
      home: ResponsiveScaffold(
        doc: _doc!,
        currentIndex: _currentPageIndex,
        child: EddiePage(page: _doc!.pages[_currentPageIndex]),
      ),
    );
  }
}
