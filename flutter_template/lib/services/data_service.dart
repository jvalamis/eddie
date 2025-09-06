import 'dart:convert';
import 'package:flutter/services.dart';
import '../models/website_data.dart';

class DataService {
  static WebsiteData? _websiteData;
  
  static Future<WebsiteData> loadWebsiteData() async {
    if (_websiteData != null) {
      return _websiteData!;
    }

    try {
      // Try to load from assets first (for development)
      final String jsonString = await rootBundle.loadString('assets/site-data.json');
      final Map<String, dynamic> jsonData = json.decode(jsonString);
      _websiteData = WebsiteData.fromJson(jsonData);
      return _websiteData!;
    } catch (e) {
      // If not found in assets, try to load from the web
      try {
        // This would be the actual URL in production
        // final response = await http.get(Uri.parse('https://username.github.io/repo-name/site-data.json'));
        // final Map<String, dynamic> jsonData = json.decode(response.body);
        // _websiteData = WebsiteData.fromJson(jsonData);
        // return _websiteData!;
        
        // For now, return empty data
        throw Exception('No data available');
      } catch (e) {
        throw Exception('Failed to load website data: $e');
      }
    }
  }

  static void clearCache() {
    _websiteData = null;
  }
}
