import 'package:flutter/material.dart';
import '../models/website_data.dart';

class PageCard extends StatelessWidget {
  final PageData page;
  final VoidCallback? onTap;

  const PageCard({
    super.key,
    required this.page,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title
              if (page.title.isNotEmpty) ...[
                Text(
                  page.title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
              ],
              
              // Description
              if (page.description.isNotEmpty) ...[
                Text(
                  page.description,
                  style: Theme.of(context).textTheme.bodyMedium,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),
              ],
              
              // Stats Row
              Row(
                children: [
                  _buildStatChip(
                    context,
                    Icons.title,
                    '${page.headings.length} headings',
                    Colors.blue,
                  ),
                  const SizedBox(width: 8),
                  _buildStatChip(
                    context,
                    Icons.article,
                    '${page.paragraphs.length} paragraphs',
                    Colors.green,
                  ),
                ],
              ),
              
              const SizedBox(height: 8),
              
              // Additional Stats
              Row(
                children: [
                  if (page.images.isNotEmpty)
                    _buildStatChip(
                      context,
                      Icons.image,
                      '${page.images.length} images',
                      Colors.orange,
                    ),
                  if (page.images.isNotEmpty) const SizedBox(width: 8),
                  if (page.links.isNotEmpty)
                    _buildStatChip(
                      context,
                      Icons.link,
                      '${page.links.length} links',
                      Colors.purple,
                    ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // URL
              Row(
                children: [
                  const Icon(Icons.link, size: 16, color: Colors.grey),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      page.url,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.blue,
                        decoration: TextDecoration.underline,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatChip(BuildContext context, IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
              fontSize: 12,
              color: color,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
