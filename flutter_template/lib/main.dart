import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  runApp(const BayouArtsApp());
}

class BayouArtsApp extends StatelessWidget {
  const BayouArtsApp({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFF9C27B0), // Bayou Arts purple
      brightness: Brightness.light,
    );

    return MaterialApp(
      title: 'Bayou Arts',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: colorScheme,
        textTheme: GoogleFonts.interTextTheme(),
      ),
      home: const BayouArtsHome(),
    );
  }
}

class BayouArtsHome extends StatelessWidget {
  const BayouArtsHome({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Hero Section
            Container(
              height: 400,
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Theme.of(context).colorScheme.primary,
                    Theme.of(context).colorScheme.secondary,
                    Theme.of(context).colorScheme.tertiary,
                  ],
                ),
              ),
              child: Stack(
                children: [
                  // Hero content
                  Positioned(
                    bottom: 40,
                    left: 24,
                    right: 24,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Home - Bayou Arts',
                          style: Theme.of(context).textTheme.displayMedium?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                shadows: [
                                  Shadow(
                                    offset: const Offset(0, 2),
                                    blurRadius: 4,
                                    color: Colors.black.withOpacity(0.5),
                                  ),
                                ],
                              ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Making Art Work - The Bayou Regional Arts Council works to support arts access in the Assumption, Lafourche, St. Charles, St. James, St. John the Baptist, and Terrebonne parishes through grants, workshops, and networking opportunities for artists and organizations.',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                color: Colors.white.withOpacity(0.9),
                                shadows: [
                                  Shadow(
                                    offset: const Offset(0, 1),
                                    blurRadius: 2,
                                    color: Colors.black.withOpacity(0.5),
                                  ),
                                ],
                              ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            // Content Section
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'About Bayou Arts',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'The Bayou Regional Arts Council works to support arts access in the Assumption, Lafourche, St. Charles, St. James, St. John the Baptist, and Terrebonne parishes through grants, workshops, and networking opportunities for artists and organizations.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          height: 1.6,
                        ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Our Mission',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'We believe that art is essential to the cultural and economic vitality of our region. Through our programs and partnerships, we work to ensure that everyone has access to quality arts experiences.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          height: 1.6,
                        ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Services',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                  ),
                  const SizedBox(height: 16),
                  ...['Grants for artists and organizations', 'Workshops and training programs', 'Networking opportunities', 'Cultural events and exhibitions'].map((service) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          margin: const EdgeInsets.only(top: 8, right: 12),
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.primary,
                            shape: BoxShape.circle,
                          ),
                        ),
                        Expanded(
                          child: Text(
                            service,
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                  height: 1.5,
                                ),
                          ),
                        ),
                      ],
                    ),
                  )),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}


