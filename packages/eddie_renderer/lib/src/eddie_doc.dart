import 'dart:convert';

/// Canonical content model for Eddie
class EddieDoc {
  final String version;
  final Site site;
  final List<NavItem> nav;
  final List<PageDoc> pages;

  EddieDoc({
    required this.version,
    required this.site,
    required this.nav,
    required this.pages,
  });

  factory EddieDoc.fromJson(Map<String, dynamic> json) {
    return EddieDoc(
      version: json['version'] as String,
      site: Site.fromJson(json['site'] as Map<String, dynamic>),
      nav: (json['nav'] as List)
          .map((item) => NavItem.fromJson(item as Map<String, dynamic>))
          .toList(),
      pages: (json['pages'] as List)
          .map((item) => PageDoc.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'version': version,
      'site': site.toJson(),
      'nav': nav.map((item) => item.toJson()).toList(),
      'pages': pages.map((page) => page.toJson()).toList(),
    };
  }
}

class Site {
  final String title;
  final String? description;
  final String? brandSeed;
  final String? logo;

  Site({
    required this.title,
    this.description,
    this.brandSeed,
    this.logo,
  });

  factory Site.fromJson(Map<String, dynamic> json) {
    return Site(
      title: json['title'] as String,
      description: json['description'] as String?,
      brandSeed: json['brandSeed'] as String?,
      logo: json['logo'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      if (description != null) 'description': description,
      if (brandSeed != null) 'brandSeed': brandSeed,
      if (logo != null) 'logo': logo,
    };
  }
}

class NavItem {
  final String title;
  final String slug;

  NavItem({
    required this.title,
    required this.slug,
  });

  factory NavItem.fromJson(Map<String, dynamic> json) {
    return NavItem(
      title: json['title'] as String,
      slug: json['slug'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'slug': slug,
    };
  }
}

class PageDoc {
  final String slug;
  final String title;
  final EddieHero? hero;
  final List<Section> sections;

  PageDoc({
    required this.slug,
    required this.title,
    this.hero,
    required this.sections,
  });

  factory PageDoc.fromJson(Map<String, dynamic> json) {
    return PageDoc(
      slug: json['slug'] as String,
      title: json['title'] as String,
      hero: json['hero'] != null
          ? EddieHero.fromJson(json['hero'] as Map<String, dynamic>)
          : null,
      sections: (json['sections'] as List)
          .map((item) => Section.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'slug': slug,
      'title': title,
      if (hero != null) 'hero': hero!.toJson(),
      'sections': sections.map((section) => section.toJson()).toList(),
    };
  }
}

class EddieHero {
  final String? title;
  final String? subtitle;
  final String? image;

  EddieHero({
    this.title,
    this.subtitle,
    this.image,
  });

  factory EddieHero.fromJson(Map<String, dynamic> json) {
    return EddieHero(
      title: json['title'] as String?,
      subtitle: json['subtitle'] as String?,
      image: json['image'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (title != null) 'title': title,
      if (subtitle != null) 'subtitle': subtitle,
      if (image != null) 'image': image,
    };
  }
}

class Section {
  final String type;
  final Map<String, dynamic> data;

  Section(this.type, this.data);

  factory Section.fromJson(Map<String, dynamic> json) {
    final type = json['type'] as String;
    final data = Map<String, dynamic>.from(json);
    data.remove('type');
    return Section(type, data);
  }

  Map<String, dynamic> toJson() {
    final result = Map<String, dynamic>.from(data);
    result['type'] = type;
    return result;
  }
}
