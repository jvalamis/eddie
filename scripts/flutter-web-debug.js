#!/usr/bin/env node

const puppeteer = require("puppeteer");
const { program } = require("commander");

program
  .option("-u, --url <url>", "URL to debug")
  .option("-t, --timeout <timeout>", "Timeout in milliseconds", "30000")
  .option("--inspector", "Enable Flutter inspector")
  .option("--profile", "Enable performance profiling")
  .option("--debug", "Enable debug mode")
  .parse();

const options = program.opts();

async function debugFlutterWeb() {
  const url = options.url;
  const timeout = parseInt(options.timeout);

  if (!url) {
    console.error("❌ URL is required");
    process.exit(1);
  }

  // Build debug URL with query parameters
  let debugUrl = url;
  const params = new URLSearchParams();

  if (options.inspector) params.append("flutter_inspector", "true");
  if (options.profile) params.append("profile", "true");
  if (options.debug) params.append("debug", "true");

  if (params.toString()) {
    debugUrl += (url.includes("?") ? "&" : "?") + params.toString();
  }

  console.log("🐛 Flutter Web Debugger");
  console.log("======================");
  console.log(`📱 URL: ${debugUrl}`);
  console.log(`⏱️  Timeout: ${timeout}ms`);
  console.log("");

  const browser = await puppeteer.launch({
    headless: true, // Run headless for automation
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Enable console logging
    page.on("console", (msg) => {
      const type = msg.type();
      const text = msg.text();

      if (type === "error") {
        console.log(`❌ Console Error: ${text}`);
      } else if (type === "warning") {
        console.log(`⚠️  Console Warning: ${text}`);
      } else if (type === "debug") {
        console.log(`🐛 Console Debug: ${text}`);
      } else if (text.includes("Flutter") || text.includes("flutter")) {
        console.log(`📱 Flutter: ${text}`);
      }
    });

    // Enable network monitoring
    page.on("response", (response) => {
      if (!response.ok()) {
        console.log(
          `🌐 Network Error: ${response.url()} -> ${response.status()}`
        );
      }
    });

    console.log("🚀 Loading page...");
    await page.goto(debugUrl, { waitUntil: "networkidle0", timeout });

    console.log("⏳ Waiting for Flutter to initialize...");

    // Wait for Flutter to be available
    await page.waitForFunction(
      () => {
        return (
          window.flutter !== undefined ||
          document.querySelector("flutter-view") !== null ||
          document.querySelector("flt-scene-host") !== null
        );
      },
      { timeout }
    );

    console.log("✅ Flutter detected!");

    // Check Flutter status
    const flutterStatus = await page.evaluate(() => {
      return {
        hasFlutter: window.flutter !== undefined,
        hasFlutterLoader: window._flutter !== undefined,
        hasFlutterView: document.querySelector("flutter-view") !== null,
        hasSceneHost: document.querySelector("flt-scene-host") !== null,
        bodyContent: document.body.innerText.length,
        scripts: document.querySelectorAll("script").length,
        errors: window.flutterErrors || [],
      };
    });

    console.log("📊 Flutter Status:");
    console.log(`  Has Flutter: ${flutterStatus.hasFlutter}`);
    console.log(`  Has Flutter Loader: ${flutterStatus.hasFlutterLoader}`);
    console.log(`  Has Flutter View: ${flutterStatus.hasFlutterView}`);
    console.log(`  Has Scene Host: ${flutterStatus.hasSceneHost}`);
    console.log(`  Body Content Length: ${flutterStatus.bodyContent}`);
    console.log(`  Scripts: ${flutterStatus.scripts}`);

    if (flutterStatus.errors.length > 0) {
      console.log("❌ Flutter Errors:");
      flutterStatus.errors.forEach((error) => console.log(`  ${error}`));
    }

    // Try to interact with Flutter elements
    console.log("🔄 Attempting to interact with Flutter app...");

    const interactionResults = await page.evaluate(() => {
      const flutterElements = document.querySelectorAll(
        "flutter-view, flt-scene-host, [data-flutter]"
      );
      const materialElements = document.querySelectorAll(
        '[class*="material"], [class*="Material"]'
      );
      const totalElements = document.querySelectorAll("*").length;
      const hasCanvas = document.querySelector("canvas") !== null;
      const hasFlutterCanvas =
        document.querySelector("canvas[data-flutter]") !== null;

      return {
        flutterElements: flutterElements.length,
        materialElements: materialElements.length,
        totalElements,
        hasCanvas,
        hasFlutterCanvas,
      };
    });

    console.log("🎯 Interaction Results:");
    console.log(`  Flutter Elements: ${interactionResults.flutterElements}`);
    console.log(`  Material Elements: ${interactionResults.materialElements}`);
    console.log(`  Total Elements: ${interactionResults.totalElements}`);
    console.log(`  Has Canvas: ${interactionResults.hasCanvas}`);
    console.log(`  Has Flutter Canvas: ${interactionResults.hasFlutterCanvas}`);

    // Check for Flutter app content
    console.log("📱 Checking for Flutter app content...");

    const contentCheck = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const hasContent = bodyText.length > 100; // More than just Flutter boilerplate
      const hasFlutterContent =
        bodyText.includes("Example Domain") ||
        bodyText.includes("Website") ||
        bodyText.length > 500;

      return {
        hasContent,
        hasFlutterContent,
        contentLength: bodyText.length,
        contentPreview: bodyText.substring(0, 200),
      };
    });

    console.log("📊 Content Check:");
    console.log(`  Has Content: ${contentCheck.hasContent}`);
    console.log(`  Has Flutter Content: ${contentCheck.hasFlutterContent}`);
    console.log(`  Content Length: ${contentCheck.contentLength}`);
    console.log(`  Content Preview: ${contentCheck.contentPreview}`);

    if (options.inspector) {
      console.log("🔍 Flutter Inspector enabled - check browser DevTools");
    }

    if (options.profile) {
      console.log("⚡ Performance profiling enabled - check browser DevTools");
    }

    console.log("");
    console.log("✅ Debug complete!");
    console.log("💡 Check the browser DevTools for more detailed information");
    console.log("🔍 Look for Flutter tab in DevTools if inspector is enabled");

    // Return structured debug results for automation
    const debugResults = {
      status: "success",
      flutterStatus,
      interactionResults,
      contentCheck,
      url: debugUrl,
      timestamp: new Date().toISOString(),
    };

    console.log("");
    console.log("📊 DEBUG RESULTS SUMMARY:");
    console.log("========================");
    console.log(`✅ Flutter Loader: ${flutterStatus.hasFlutterLoader}`);
    console.log(`✅ Flutter App: ${flutterStatus.hasFlutter}`);
    console.log(`✅ Content Loaded: ${contentCheck.hasFlutterContent}`);
    console.log(`✅ Flutter Elements: ${interactionResults.flutterElements}`);
    console.log(`✅ Content Length: ${contentCheck.contentLength}`);

    if (flutterStatus.errors.length > 0) {
      console.log(`❌ Errors Found: ${flutterStatus.errors.length}`);
      debugResults.status = "error";
    }

    return debugResults;
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

debugFlutterWeb().catch(console.error);
