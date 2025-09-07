# Flutter Web Debugging Rules

## Overview

This document defines the proper methodology for debugging Flutter web applications deployed to GitHub Pages. These rules ensure we use Flutter's built-in debugging capabilities and follow best practices for web app troubleshooting.

## Core Principles

### 1. **Use Official Flutter Debugging Tools First**

- Always prefer Flutter's built-in debugging over custom health checkers
- Leverage browser DevTools with Flutter-specific extensions
- Use Flutter Web Inspector for widget tree inspection
- Enable Flutter debug mode with query parameters

### 2. **Progressive Debugging Approach**

1. **Browser DevTools Console** - Check for JavaScript errors first
2. **Flutter Web Inspector** - Inspect widget tree and state
3. **Network Tab** - Verify resource loading
4. **Performance Tab** - Check rendering performance
5. **Custom Scripts** - Only as last resort

### 3. **Flutter-Specific Debug URLs**

Always test with these debug parameters:

- `?flutter_inspector=true` - Enable Flutter Inspector
- `?debug=true` - Enable debug mode
- `?profile=true` - Enable performance profiling
- `?flutter_inspector=true&debug=true` - Combined debugging

## Debugging Methodology

### Phase 1: Automatic Pipeline Debugging

**Flutter debugging now runs automatically in GitHub Actions after deployment.**

**The pipeline automatically checks for:**

- Flutter loader presence (`window._flutter`)
- Flutter app initialization (`window.flutter`)
- Console errors and warnings
- Network request failures
- Resource loading issues
- Flutter app content loading
- Performance metrics

**Manual debugging (if needed):**

```bash
# Use the official Flutter debug script for manual testing
npm run flutter-debug -- --url "https://example.com" --inspector --debug
```

### Phase 2: Flutter Inspector Analysis

**Access Flutter Inspector:**

1. Open app in Chrome/Edge
2. Press F12 → DevTools
3. Look for "Flutter" tab
4. Or use `?flutter_inspector=true` URL parameter

**Inspect:**

- Widget tree structure
- Widget properties and state
- Render tree performance
- Layout constraints
- Material Design components

### Phase 3: Console Error Analysis

**Critical Error Patterns:**

- `NoSuchMethodError` - Missing methods or incorrect API usage
- `TypeError` - Type mismatches in JavaScript
- `Uncaught Exception` - Unhandled Flutter errors
- `Failed to load` - Resource loading failures
- `Flutter initialization failed` - App startup issues

### Phase 4: Network Resource Verification

**Required Resources:**

- `main.dart.js` - Main Flutter app bundle
- `flutter_bootstrap.js` - Flutter initialization
- `site-data.json` - App data
- `canvaskit.js` - Canvas rendering (if using CanvasKit)
- `flutter_service_worker.js` - Service worker

**Check:**

- HTTP status codes (200, 404, 500)
- Content-Type headers
- CORS issues
- Cache headers
- File sizes and loading times

### Phase 5: Performance Analysis

**Use `?profile=true` for:**

- Frame rate monitoring
- Memory usage tracking
- Render performance
- JavaScript execution time
- Network request timing

## Flutter Web-Specific Issues

### Common Flutter Web Problems

#### 1. **Initialization Failures**

**Symptoms:**

- Blank page with Flutter CSS but no content
- "Flutter internal initializer not found"
- Console errors about missing Flutter objects

**Debug Steps:**

1. Check `flutter_bootstrap.js` loading
2. Verify `main.dart.js` accessibility
3. Check for JavaScript errors in console
4. Verify base href configuration
5. Test with `?debug=true` parameter

#### 2. **Data Loading Issues**

**Symptoms:**

- "Error loading data" screen
- App loads but shows fallback content
- Network errors in console

**Debug Steps:**

1. Verify `site-data.json` accessibility
2. Check DataService implementation
3. Test with `?flutter_inspector=true`
4. Inspect widget tree for data binding
5. Check for CORS issues

#### 3. **Rendering Problems**

**Symptoms:**

- App loads but content is invisible
- Layout issues or broken UI
- Performance problems

**Debug Steps:**

1. Use Flutter Inspector to check widget tree
2. Enable `?profile=true` for performance analysis
3. Check for CSS conflicts
4. Verify Material Design components
5. Test responsive layout

#### 4. **GitHub Pages Specific Issues**

**Symptoms:**

- 404 errors for Flutter resources
- Base href path problems
- Service worker issues

**Debug Steps:**

1. Verify GitHub Pages deployment
2. Check base href configuration
3. Test direct resource URLs
4. Verify GitHub Actions workflow
5. Check repository file structure

## Debugging Commands

### Automatic Pipeline Debugging

**Flutter debugging runs automatically in GitHub Actions after deployment.**

**To monitor debugging:**

1. Go to your repository's Actions tab
2. Click on the latest workflow run
3. Look for "Run Flutter debugging" step
4. Check the logs for Flutter status and any errors

### Manual Debugging (When Needed)

```bash
# Basic Flutter debugging
npm run flutter-debug -- --url "https://example.com"

# With Flutter Inspector
npm run flutter-debug -- --url "https://example.com" --inspector

# With performance profiling
npm run flutter-debug -- --url "https://example.com" --profile

# Combined debugging
npm run flutter-debug -- --url "https://example.com" --inspector --debug --profile
```

### Manual Browser Testing

```bash
# Test debug URLs manually
open "https://example.com?flutter_inspector=true"
open "https://example.com?debug=true"
open "https://example.com?profile=true"
```

### Resource Verification

```bash
# Check Flutter resources
curl -I https://example.com/main.dart.js
curl -I https://example.com/flutter_bootstrap.js
curl -I https://example.com/site-data.json
```

## Success Criteria

### App is Working Correctly When:

1. ✅ Flutter Inspector shows complete widget tree
2. ✅ Console shows no critical errors
3. ✅ All Flutter resources load successfully (200 status)
4. ✅ App content is visible and interactive
5. ✅ Performance metrics are within acceptable ranges
6. ✅ Material Design components render properly
7. ✅ Responsive layout works on different screen sizes

### App Needs Fixing When:

1. ❌ Flutter Inspector shows no widget tree
2. ❌ Console shows JavaScript errors
3. ❌ Flutter resources return 404/500 errors
4. ❌ App shows "Error loading data" or blank screen
5. ❌ Performance issues (slow rendering, memory leaks)
6. ❌ Layout problems or broken UI
7. ❌ Non-responsive design

## Error Resolution Priority

### Critical (Fix Immediately)

- Flutter initialization failures
- JavaScript runtime errors
- Missing Flutter resources
- Data loading failures

### High Priority

- Performance issues
- Layout problems
- Material Design component issues
- Responsive design problems

### Medium Priority

- Console warnings
- Minor UI inconsistencies
- Accessibility issues
- SEO optimization

### Low Priority

- Code style issues
- Documentation updates
- Minor performance optimizations

## Best Practices

### 1. **Always Use Official Tools**

- Prefer Flutter Inspector over custom debugging
- Use browser DevTools with Flutter extensions
- Leverage Flutter's built-in error reporting

### 2. **Systematic Approach**

- Follow the 5-phase debugging methodology
- Document findings at each phase
- Use progressive debugging (simple to complex)

### 3. **Environment Consistency**

- Test in multiple browsers (Chrome, Edge, Firefox)
- Verify on different screen sizes
- Check both desktop and mobile views

### 4. **Documentation**

- Record all debugging steps taken
- Document error patterns and solutions
- Update debugging rules based on findings

### 5. **Performance Monitoring**

- Always check performance with `?profile=true`
- Monitor memory usage and frame rates
- Test on slower devices/connections

## Integration with GitHub Actions Pipeline

### Automatic Flutter Debugging

**Flutter debugging is now fully integrated into the GitHub Actions pipeline:**

- ✅ **Automatic execution** after GitHub Pages deployment
- ✅ **Flutter Inspector integration** with debug parameters
- ✅ **Console error monitoring** and reporting
- ✅ **Network request verification** for Flutter resources
- ✅ **Content loading validation** for Flutter apps
- ✅ **Performance metrics** collection

### Pipeline Debugging Features

- **Headless browser testing** with Puppeteer
- **Flutter-specific status checks** (loader, app, content)
- **Automatic error detection** and reporting
- **Resource accessibility verification**
- **Content validation** for deployed apps

### Manual Debugging (When Needed)

- Use `npm run flutter-debug` for local testing
- Access Flutter Inspector via browser DevTools
- Test with debug parameters (`?flutter_inspector=true`)
- Monitor performance with profiling tools

## Conclusion

These rules ensure we use Flutter's official debugging capabilities integrated into our GitHub Actions pipeline. By running Flutter debugging automatically after deployment, we get immediate feedback on app health and can catch issues before they affect users.

**Key Benefits:**

- **Automatic debugging** runs after every deployment
- **Official Flutter tools** provide accurate diagnostics
- **Pipeline integration** gives immediate feedback
- **Manual debugging** available when needed
- **Best practices** for Flutter web app troubleshooting

**Remember:** Flutter debugging now runs automatically in the pipeline. Check the GitHub Actions logs for debugging results, and use manual debugging only when additional investigation is needed.
