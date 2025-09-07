class WebsiteData {
  final String domain;
  final String originalUrl;
  final DateTime crawledAt;
  final String title;
  final String description;
  final String keywords;
  final List<PageData> pages;
  final List<AssetData> assets;

  WebsiteData({
    required this.domain,
    required this.originalUrl,
    required this.crawledAt,
    required this.title,
    required this.description,
    required this.keywords,
    required this.pages,
    required this.assets,
  });

  factory WebsiteData.fromJson(Map<String, dynamic> json) {
    return WebsiteData(
      domain: json['metadata']['domain'] ?? '',
      originalUrl: json['metadata']['originalUrl'] ?? '',
      crawledAt: DateTime.parse(json['metadata']['crawledAt'] ?? DateTime.now().toIso8601String()),
      title: json['metadata']['title'] ?? 'Website',
      description: json['metadata']['description'] ?? '',
      keywords: json['metadata']['keywords'] ?? '',
      pages: (json['pages'] as List<dynamic>?)
          ?.map((page) => PageData.fromJson(page))
          .toList() ?? [],
      assets: (json['assets'] as List<dynamic>?)
          ?.map((asset) => AssetData.fromJson(asset))
          .toList() ?? [],
    );
  }
}

class PageData {
  final String url;
  final String path;
  final String title;
  final String description;
  final PageContentData content;
  final HeaderData? header;
  final FooterData? footer;
  final SidebarData? sidebar;
  final MainContentData? mainContent;

  PageData({
    required this.url,
    required this.path,
    required this.title,
    required this.description,
    required this.content,
    this.header,
    this.footer,
    this.sidebar,
    this.mainContent,
  });

  factory PageData.fromJson(Map<String, dynamic> json) {
    return PageData(
      url: json['url'] ?? '',
      path: json['path'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      content: PageContentData.fromJson(json['content'] ?? {}),
      header: json['header'] != null ? HeaderData.fromJson(json['header']) : null,
      footer: json['footer'] != null ? FooterData.fromJson(json['footer']) : null,
      sidebar: json['sidebar'] != null ? SidebarData.fromJson(json['sidebar']) : null,
      mainContent: json['mainContent'] != null ? MainContentData.fromJson(json['mainContent']) : null,
    );
  }
}

class PageContentData {
  final List<HeadingData> headings;
  final List<ParagraphData> paragraphs;
  final List<ImageData> images;
  final List<LinkData> links;
  final List<ListData> lists;
  final List<TableData> tables;
  final List<FormData> forms;
  final List<ContentBlockData> contentBlocks;

  PageContentData({
    required this.headings,
    required this.paragraphs,
    required this.images,
    required this.links,
    required this.lists,
    required this.tables,
    required this.forms,
    required this.contentBlocks,
  });

  factory PageContentData.fromJson(Map<String, dynamic> json) {
    return PageContentData(
      headings: (json['headings'] as List<dynamic>?)
          ?.map((h) => HeadingData.fromJson(h))
          .toList() ?? [],
      paragraphs: (json['paragraphs'] as List<dynamic>?)
          ?.map((p) => ParagraphData.fromJson(p))
          .toList() ?? [],
      images: (json['images'] as List<dynamic>?)
          ?.map((i) => ImageData.fromJson(i))
          .toList() ?? [],
      links: (json['links'] as List<dynamic>?)
          ?.map((l) => LinkData.fromJson(l))
          .toList() ?? [],
      lists: (json['lists'] as List<dynamic>?)
          ?.map((l) => ListData.fromJson(l))
          .toList() ?? [],
      tables: (json['tables'] as List<dynamic>?)
          ?.map((t) => TableData.fromJson(t))
          .toList() ?? [],
      forms: (json['forms'] as List<dynamic>?)
          ?.map((f) => FormData.fromJson(f))
          .toList() ?? [],
      contentBlocks: (json['contentBlocks'] as List<dynamic>?)
          ?.map((c) => ContentBlockData.fromJson(c))
          .toList() ?? [],
    );
  }
}

class ContentBlockData {
  final String type;
  final String content;
  final List<String> classes;

  ContentBlockData({
    required this.type,
    required this.content,
    required this.classes,
  });

  factory ContentBlockData.fromJson(Map<String, dynamic> json) {
    return ContentBlockData(
      type: json['type'] ?? '',
      content: json['content'] ?? '',
      classes: (json['classes'] as List<dynamic>?)?.cast<String>() ?? [],
    );
  }
}

class HeadingData {
  final String text;
  final int level;
  final String? id;

  HeadingData({required this.text, required this.level, this.id});

  factory HeadingData.fromJson(Map<String, dynamic> json) {
    return HeadingData(
      text: json['text'] ?? '',
      level: json['level'] ?? 1,
      id: json['id'],
    );
  }
}

class ParagraphData {
  final String text;
  final List<String> classes;

  ParagraphData({required this.text, required this.classes});

  factory ParagraphData.fromJson(Map<String, dynamic> json) {
    return ParagraphData(
      text: json['text'] ?? '',
      classes: (json['classes'] as List<dynamic>?)?.cast<String>() ?? [],
    );
  }
}

class ImageData {
  final String src;
  final String? alt;
  final String? title;
  final int? width;
  final int? height;

  ImageData({required this.src, this.alt, this.title, this.width, this.height});

  factory ImageData.fromJson(Map<String, dynamic> json) {
    return ImageData(
      src: json['src'] ?? '',
      alt: json['alt'],
      title: json['title'],
      width: json['width'],
      height: json['height'],
    );
  }
}

class LinkData {
  final String href;
  final String text;
  final String? target;
  final List<String> classes;

  LinkData({required this.href, required this.text, this.target, required this.classes});

  factory LinkData.fromJson(Map<String, dynamic> json) {
    return LinkData(
      href: json['href'] ?? '',
      text: json['text'] ?? '',
      target: json['target'],
      classes: (json['classes'] as List<dynamic>?)?.cast<String>() ?? [],
    );
  }
}

class ListData {
  final String type;
  final List<String> items;

  ListData({required this.type, required this.items});

  factory ListData.fromJson(Map<String, dynamic> json) {
    return ListData(
      type: json['type'] ?? 'ul',
      items: (json['items'] as List<dynamic>?)?.cast<String>() ?? [],
    );
  }
}

class TableData {
  final List<String> headers;
  final List<List<String>> rows;

  TableData({required this.headers, required this.rows});

  factory TableData.fromJson(Map<String, dynamic> json) {
    return TableData(
      headers: (json['headers'] as List<dynamic>?)?.cast<String>() ?? [],
      rows: (json['rows'] as List<dynamic>?)
          ?.map((row) => (row as List<dynamic>).cast<String>())
          .toList() ?? [],
    );
  }
}

class FormData {
  final String action;
  final String method;
  final List<FormFieldData> fields;

  FormData({required this.action, required this.method, required this.fields});

  factory FormData.fromJson(Map<String, dynamic> json) {
    return FormData(
      action: json['action'] ?? '',
      method: json['method'] ?? 'GET',
      fields: (json['fields'] as List<dynamic>?)
          ?.map((f) => FormFieldData.fromJson(f))
          .toList() ?? [],
    );
  }
}

class FormFieldData {
  final String type;
  final String name;
  final String? label;
  final String? placeholder;
  final bool required;

  FormFieldData({
    required this.type,
    required this.name,
    this.label,
    this.placeholder,
    required this.required,
  });

  factory FormFieldData.fromJson(Map<String, dynamic> json) {
    return FormFieldData(
      type: json['type'] ?? 'text',
      name: json['name'] ?? '',
      label: json['label'],
      placeholder: json['placeholder'],
      required: json['required'] ?? false,
    );
  }
}

class HeaderData {
  final String? logo;
  final List<LinkData> navigation;

  HeaderData({this.logo, required this.navigation});

  factory HeaderData.fromJson(Map<String, dynamic> json) {
    return HeaderData(
      logo: json['logo'],
      navigation: (json['navigation'] as List<dynamic>?)
          ?.map((n) => LinkData.fromJson(n))
          .toList() ?? [],
    );
  }
}

class FooterData {
  final List<LinkData> links;
  final String? copyright;

  FooterData({required this.links, this.copyright});

  factory FooterData.fromJson(Map<String, dynamic> json) {
    return FooterData(
      links: (json['links'] as List<dynamic>?)
          ?.map((l) => LinkData.fromJson(l))
          .toList() ?? [],
      copyright: json['copyright'],
    );
  }
}

class SidebarData {
  final List<LinkData> links;
  final List<dynamic> widgets;

  SidebarData({required this.links, required this.widgets});

  factory SidebarData.fromJson(Map<String, dynamic> json) {
    return SidebarData(
      links: (json['links'] as List<dynamic>?)
          ?.map((l) => LinkData.fromJson(l))
          .toList() ?? [],
      widgets: [], // Widgets would need special handling
    );
  }
}

class MainContentData {
  final List<dynamic> content;

  MainContentData({required this.content});

  factory MainContentData.fromJson(Map<String, dynamic> json) {
    return MainContentData(
      content: json['content'] ?? [],
    );
  }
}

class AssetData {
  final String url;
  final String path;
  final String type;
  final int size;

  AssetData({
    required this.url,
    required this.path,
    required this.type,
    required this.size,
  });

  factory AssetData.fromJson(Map<String, dynamic> json) {
    return AssetData(
      url: json['url'] ?? '',
      path: json['path'] ?? '',
      type: json['type'] ?? '',
      size: json['size'] ?? 0,
    );
  }
}
