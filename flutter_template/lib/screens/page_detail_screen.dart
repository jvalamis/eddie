import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/website_data.dart';
import '../widgets/responsive_image.dart';
import '../utils/responsive_layout.dart';

class PageDetailScreen extends StatelessWidget {
  final PageData page;

  const PageDetailScreen({super.key, required this.page});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          page.title.isNotEmpty ? page.title : 'Page Details',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        centerTitle: false,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(ResponsiveLayout.spacing16),
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxWidth: ResponsiveLayout.maxContentWidth,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildPageHeader(context),
              SizedBox(height: ResponsiveLayout.spacing24),
              
              // Content Sections with proper hierarchy
              if (page.content.headings.isNotEmpty) ...[
                _buildContentSection(
                  context,
                  'Content Structure',
                  Icons.title,
                  _buildHeadingsList(context),
                ),
                SizedBox(height: ResponsiveLayout.spacing24),
              ],
              
              if (page.content.paragraphs.isNotEmpty) ...[
                _buildContentSection(
                  context,
                  'Main Content',
                  Icons.article,
                  _buildParagraphsList(context),
                ),
                SizedBox(height: ResponsiveLayout.spacing24),
              ],
              
              if (page.content.images.isNotEmpty) ...[
                _buildContentSection(
                  context,
                  'Images',
                  Icons.image,
                  _buildImagesGrid(context),
                ),
                SizedBox(height: ResponsiveLayout.spacing24),
              ],
              
              if (page.content.links.isNotEmpty) ...[
                _buildContentSection(
                  context,
                  'Related Links',
                  Icons.link,
                  _buildLinksList(context),
                ),
                SizedBox(height: ResponsiveLayout.spacing24),
              ],
              
              if (page.content.lists.isNotEmpty) ...[
                _buildContentSection(
                  context,
                  'Lists',
                  Icons.list,
                  _buildListsList(context),
                ),
                SizedBox(height: ResponsiveLayout.spacing24),
              ],
              
              if (page.content.tables.isNotEmpty) ...[
                _buildContentSection(
                  context,
                  'Data Tables',
                  Icons.table_chart,
                  _buildTablesList(context),
                ),
                SizedBox(height: ResponsiveLayout.spacing24),
              ],
              
              if (page.content.forms.isNotEmpty) ...[
                _buildContentSection(
                  context,
                  'Forms',
                  Icons.assignment,
                  _buildFormsList(context),
                ),
                SizedBox(height: ResponsiveLayout.spacing24),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPageHeader(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: EdgeInsets.all(ResponsiveLayout.spacing20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              page.title,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            if (page.description.isNotEmpty) ...[
              SizedBox(height: ResponsiveLayout.spacing8),
              Text(
                page.description,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
            ],
            SizedBox(height: ResponsiveLayout.spacing16),
            Container(
              padding: EdgeInsets.all(ResponsiveLayout.spacing12),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surfaceVariant,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.link,
                    size: 20,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  SizedBox(width: ResponsiveLayout.spacing8),
                  Expanded(
                    child: Text(
                      page.url,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Theme.of(context).colorScheme.primary,
                            decoration: TextDecoration.underline,
                          ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContentSection(
    BuildContext context,
    String title,
    IconData icon,
    Widget content,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              icon,
              color: Theme.of(context).colorScheme.primary,
              size: 24,
            ),
            SizedBox(width: ResponsiveLayout.spacing8),
            Text(
              title,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ],
        ),
        SizedBox(height: ResponsiveLayout.spacing16),
        content,
      ],
    );
  }

  Widget _buildHeadingsList(BuildContext context) {
    return Column(
      children: page.content.headings.map((heading) {
        return Container(
          margin: EdgeInsets.only(bottom: ResponsiveLayout.spacing8),
          padding: EdgeInsets.all(ResponsiveLayout.spacing12),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.3),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Center(
                  child: Text(
                    'H${heading.level}',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.onPrimary,
                    ),
                  ),
                ),
              ),
              SizedBox(width: ResponsiveLayout.spacing12),
              Expanded(
                child: Text(
                  heading.text,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: heading.level <= 2 ? FontWeight.bold : FontWeight.w600,
                        fontSize: heading.level == 1 ? 20 : heading.level == 2 ? 18 : 16,
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
      children: page.content.paragraphs.map((paragraph) {
        return Container(
          margin: EdgeInsets.only(bottom: ResponsiveLayout.spacing16),
          padding: EdgeInsets.all(ResponsiveLayout.spacing16),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: Theme.of(context).colorScheme.outline.withOpacity(0.2),
            ),
          ),
          child: MarkdownBody(
            data: paragraph.text,
            styleSheet: MarkdownStyleSheet(
              p: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    height: 1.6,
                  ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildImagesGrid(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = ResponsiveLayout.getCrossAxisCount(context);
        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: ResponsiveLayout.spacing12,
            mainAxisSpacing: ResponsiveLayout.spacing12,
            childAspectRatio: 1.2,
          ),
          itemCount: page.content.images.length,
          itemBuilder: (context, index) {
            final image = page.content.images[index];
            return Card(
              clipBehavior: Clip.antiAlias,
              elevation: 2,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: ResponsiveImage(
                      imageUrl: image.src,
                      altText: image.alt,
                      fit: BoxFit.cover,
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(12),
                      ),
                    ),
                  ),
                  if (image.alt != null && image.alt!.isNotEmpty)
                    Padding(
                      padding: EdgeInsets.all(ResponsiveLayout.spacing8),
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
      },
    );
  }

  Widget _buildLinksList(BuildContext context) {
    return Column(
      children: page.content.links.map((link) {
        return Card(
          margin: EdgeInsets.only(bottom: ResponsiveLayout.spacing8),
          child: ListTile(
            leading: Icon(
              Icons.link,
              color: Theme.of(context).colorScheme.primary,
            ),
            title: Text(
              link.text,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            subtitle: Text(
              link.href,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
            onTap: () => _launchUrl(link.href),
            trailing: Icon(
              Icons.open_in_new,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildListsList(BuildContext context) {
    return Column(
      children: page.content.lists.map((list) {
        return Card(
          margin: EdgeInsets.only(bottom: ResponsiveLayout.spacing12),
          child: Padding(
            padding: EdgeInsets.all(ResponsiveLayout.spacing16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${list.type.toUpperCase()} List',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                SizedBox(height: ResponsiveLayout.spacing12),
                ...list.items.map((item) => Padding(
                      padding: EdgeInsets.only(bottom: ResponsiveLayout.spacing8),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            margin: EdgeInsets.only(
                              top: ResponsiveLayout.spacing6,
                              right: ResponsiveLayout.spacing12,
                            ),
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.primary,
                              shape: BoxShape.circle,
                            ),
                          ),
                          Expanded(
                            child: Text(
                              item,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ),
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
      children: page.content.tables.map((table) {
        return Card(
          margin: EdgeInsets.only(bottom: ResponsiveLayout.spacing12),
          child: Padding(
            padding: EdgeInsets.all(ResponsiveLayout.spacing16),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                columns: table.headers.map((header) => DataColumn(
                      label: Text(
                        header,
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    )).toList(),
                rows: table.rows.map((row) => DataRow(
                      cells: row.map((cell) => DataCell(
                            Text(
                              cell,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          )).toList(),
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
      children: page.content.forms.map((form) {
        return Card(
          margin: EdgeInsets.only(bottom: ResponsiveLayout.spacing12),
          child: Padding(
            padding: EdgeInsets.all(ResponsiveLayout.spacing16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Form: ${form.action}',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                SizedBox(height: ResponsiveLayout.spacing8),
                Text(
                  'Method: ${form.method}',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                SizedBox(height: ResponsiveLayout.spacing12),
                ...form.fields.map((field) => Container(
                      margin: EdgeInsets.only(bottom: ResponsiveLayout.spacing8),
                      padding: EdgeInsets.all(ResponsiveLayout.spacing8),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Text(
                            '${field.type}: ',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                          ),
                          Text(
                            field.name,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          if (field.required)
                            Text(
                              ' (required)',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: Theme.of(context).colorScheme.error,
                                  ),
                            ),
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