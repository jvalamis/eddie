import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/website_data.dart';
import '../widgets/modern_app_bar.dart';

class PageDetailScreen extends StatelessWidget {
  final PageData page;

  const PageDetailScreen({super.key, required this.page});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: ModernAppBar(
        title: page.title.isNotEmpty ? page.title : 'Page Details',
        showBackButton: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Page Header
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (page.title.isNotEmpty) ...[
                      Text(
                        page.title,
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 8),
                    ],
                    if (page.description.isNotEmpty) ...[
                      Text(
                        page.description,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 8),
                    ],
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
            
            const SizedBox(height: 16),
            
            // Content Sections
            if (page.headings.isNotEmpty) ...[
              _buildSection(
                context,
                'Headings',
                Icons.title,
                _buildHeadingsList(context),
              ),
              const SizedBox(height: 16),
            ],
            
            if (page.paragraphs.isNotEmpty) ...[
              _buildSection(
                context,
                'Content',
                Icons.article,
                _buildParagraphsList(context),
              ),
              const SizedBox(height: 16),
            ],
            
            if (page.images.isNotEmpty) ...[
              _buildSection(
                context,
                'Images',
                Icons.image,
                _buildImagesGrid(context),
              ),
              const SizedBox(height: 16),
            ],
            
            if (page.links.isNotEmpty) ...[
              _buildSection(
                context,
                'Links',
                Icons.link,
                _buildLinksList(context),
              ),
              const SizedBox(height: 16),
            ],
            
            if (page.lists.isNotEmpty) ...[
              _buildSection(
                context,
                'Lists',
                Icons.list,
                _buildListsList(context),
              ),
              const SizedBox(height: 16),
            ],
            
            if (page.tables.isNotEmpty) ...[
              _buildSection(
                context,
                'Tables',
                Icons.table_chart,
                _buildTablesList(context),
              ),
              const SizedBox(height: 16),
            ],
            
            if (page.forms.isNotEmpty) ...[
              _buildSection(
                context,
                'Forms',
                Icons.assignment,
                _buildFormsList(context),
              ),
              const SizedBox(height: 16),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSection(BuildContext context, String title, IconData icon, Widget content) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: Theme.of(context).primaryColor),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
            const SizedBox(height: 12),
            content,
          ],
        ),
      ),
    );
  }

  Widget _buildHeadingsList(BuildContext context) {
    return Column(
      children: page.headings.map((heading) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 8.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text(
                    'H${heading.level}',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).primaryColor,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  heading.text,
                  style: TextStyle(
                    fontSize: heading.level == 1 ? 18 : heading.level == 2 ? 16 : 14,
                    fontWeight: heading.level <= 2 ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildParagraphsList(BuildContext context) {
    return Column(
      children: page.paragraphs.map((paragraph) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12.0),
          child: MarkdownBody(
            data: paragraph.text,
            styleSheet: MarkdownStyleSheet(
              p: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildImagesGrid(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
        childAspectRatio: 1.5,
      ),
      itemCount: page.images.length,
      itemBuilder: (context, index) {
        final image = page.images[index];
        return Card(
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: CachedNetworkImage(
                  imageUrl: image.src,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => const Center(
                    child: CircularProgressIndicator(),
                  ),
                  errorWidget: (context, url, error) => const Center(
                    child: Icon(Icons.error),
                  ),
                ),
              ),
              if (image.alt != null && image.alt!.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    image.alt!,
                    style: Theme.of(context).textTheme.bodySmall,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLinksList(BuildContext context) {
    return Column(
      children: page.links.map((link) {
        return ListTile(
          leading: const Icon(Icons.link),
          title: Text(link.text),
          subtitle: Text(link.href),
          onTap: () => _launchUrl(link.href),
        );
      }).toList(),
    );
  }

  Widget _buildListsList(BuildContext context) {
    return Column(
      children: page.lists.map((list) {
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${list.type.toUpperCase()} List',
                  style: Theme.of(context).textTheme.titleSmall,
                ),
                const SizedBox(height: 8),
                ...list.items.map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 4.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        list.type == 'ol' ? '•' : '•',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(width: 8),
                      Expanded(child: Text(item)),
                    ],
                  ),
                )),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildTablesList(BuildContext context) {
    return Column(
      children: page.tables.map((table) {
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                columns: table.headers.map((header) => DataColumn(
                  label: Text(header),
                )).toList(),
                rows: table.rows.map((row) => DataRow(
                  cells: row.map((cell) => DataCell(Text(cell))).toList(),
                )).toList(),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildFormsList(BuildContext context) {
    return Column(
      children: page.forms.map((form) {
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Form: ${form.action}',
                  style: Theme.of(context).textTheme.titleSmall,
                ),
                const SizedBox(height: 8),
                Text('Method: ${form.method}'),
                const SizedBox(height: 8),
                ...form.fields.map((field) => Padding(
                  padding: const EdgeInsets.only(bottom: 4.0),
                  child: Row(
                    children: [
                      Text('${field.type}: '),
                      Text(field.name),
                      if (field.required) const Text(' (required)', style: TextStyle(color: Colors.red)),
                    ],
                  ),
                )),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Future<void> _launchUrl(String url) async {
    final Uri uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }
}
