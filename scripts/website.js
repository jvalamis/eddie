#!/usr/bin/env node

// This script allows you to run: npm run <websitename>
// It will automatically generate a Flutter app from the website

const { execSync } = require("child_process");
const path = require("path");

// Get the website name from the script name
const scriptName = process.argv[1];
const websiteName = path.basename(scriptName, ".js");

// Common website URLs - you can add more here
const websiteUrls = {
  example: "https://example.com",
  google: "https://google.com",
  github: "https://github.com",
  stackoverflow: "https://stackoverflow.com",
  reddit: "https://reddit.com",
  youtube: "https://youtube.com",
  twitter: "https://twitter.com",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  linkedin: "https://linkedin.com",
  netflix: "https://netflix.com",
  spotify: "https://spotify.com",
  amazon: "https://amazon.com",
  apple: "https://apple.com",
  microsoft: "https://microsoft.com",
  tesla: "https://tesla.com",
  airbnb: "https://airbnb.com",
  uber: "https://uber.com",
  dropbox: "https://dropbox.com",
  slack: "https://slack.com",
  discord: "https://discord.com",
  twitch: "https://twitch.tv",
  medium: "https://medium.com",
  dev: "https://dev.to",
  hashnode: "https://hashnode.com",
  producthunt: "https://producthunt.com",
  hackernews: "https://news.ycombinator.com",
  wikipedia: "https://wikipedia.org",
  bbc: "https://bbc.com",
  cnn: "https://cnn.com",
  nytimes: "https://nytimes.com",
  techcrunch: "https://techcrunch.com",
  verge: "https://theverge.com",
  wired: "https://wired.com",
  arstechnica: "https://arstechnica.com",
  engadget: "https://engadget.com",
  mashable: "https://mashable.com",
  gizmodo: "https://gizmodo.com",
  lifehacker: "https://lifehacker.com",
  kotaku: "https://kotaku.com",
  jezebel: "https://jezebel.com",
  deadspin: "https://deadspin.com",
  jalopnik: "https://jalopnik.com",
  io9: "https://io9.com",
  avclub: "https://avclub.com",
  clickhole: "https://clickhole.com",
  theroot: "https://theroot.com",
  kinja: "https://kinja.com",
  earther: "https://earther.com",
  jalopnik: "https://jalopnik.com",
  thetakeout: "https://thetakeout.com",
  theinventory: "https://theinventory.com",
  jalopnik: "https://jalopnik.com",
  theinventory: "https://theinventory.com",
  thetakeout: "https://thetakeout.com",
  earther: "https://earther.com",
  kinja: "https://kinja.com",
  theroot: "https://theroot.com",
  clickhole: "https://clickhole.com",
  avclub: "https://avclub.com",
  io9: "https://io9.com",
  jalopnik: "https://jalopnik.com",
  deadspin: "https://deadspin.com",
  jezebel: "https://jezebel.com",
  kotaku: "https://kotaku.com",
  lifehacker: "https://lifehacker.com",
  gizmodo: "https://gizmodo.com",
  mashable: "https://mashable.com",
  engadget: "https://engadget.com",
  arstechnica: "https://arstechnica.com",
  wired: "https://wired.com",
  verge: "https://theverge.com",
  techcrunch: "https://techcrunch.com",
  nytimes: "https://nytimes.com",
  cnn: "https://cnn.com",
  bbc: "https://bbc.com",
  wikipedia: "https://wikipedia.org",
  hackernews: "https://news.ycombinator.com",
  producthunt: "https://producthunt.com",
  hashnode: "https://hashnode.com",
  dev: "https://dev.to",
  medium: "https://medium.com",
  twitch: "https://twitch.tv",
  discord: "https://discord.com",
  slack: "https://slack.com",
  dropbox: "https://dropbox.com",
  uber: "https://uber.com",
  airbnb: "https://airbnb.com",
  tesla: "https://tesla.com",
  microsoft: "https://microsoft.com",
  apple: "https://apple.com",
  amazon: "https://amazon.com",
  spotify: "https://spotify.com",
  netflix: "https://netflix.com",
  linkedin: "https://linkedin.com",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  twitter: "https://twitter.com",
  youtube: "https://youtube.com",
  reddit: "https://reddit.com",
  stackoverflow: "https://stackoverflow.com",
  github: "https://github.com",
  google: "https://google.com",
  example: "https://example.com",
};

// Check if the website name exists in our list
if (websiteUrls[websiteName]) {
  const url = websiteUrls[websiteName];
  console.log(`🚀 Generating Flutter app for ${websiteName}: ${url}`);

  try {
    // Run the generate script with the URL
    execSync(`npm run generate -- --url "${url}" --name "${websiteName}-app"`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    console.error(
      `❌ Failed to generate app for ${websiteName}:`,
      error.message
    );
    process.exit(1);
  }
} else {
  console.log(`❌ Website "${websiteName}" not found in predefined list.`);
  console.log("\nAvailable websites:");
  Object.keys(websiteUrls).forEach((name) => {
    console.log(`  - ${name}: ${websiteUrls[name]}`);
  });
  console.log('\nOr use: npm run generate -- --url "https://your-website.com"');
  process.exit(1);
}
