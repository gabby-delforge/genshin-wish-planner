module.exports = {
  branches: [
    "main",
    "gd/06-29-feat_changelog_add_changelog_system_for_user_notifications", // Your branch for testing
  ],
  plugins: [
    // Analyze commits to determine version bump
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [
          { type: "feat", release: "minor" },
          { type: "fix", release: "patch" },
          { type: "perf", release: "patch" },
          { type: "revert", release: "patch" },
          { type: "docs", release: false },
          { type: "style", release: false },
          { type: "chore", release: false },
          { type: "refactor", release: "patch" },
          { type: "test", release: false },
          { type: "build", release: false },
          { type: "ci", release: false },
          { breaking: true, release: "major" },
        ],
        parserOpts: {
          noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"],
        },
      },
    ],

    // Update CHANGELOG.md (move [Unreleased] to versioned section)
    [
      "@semantic-release/changelog",
      {
        changelogFile: "public/CHANGELOG.md",
      },
    ],

    // Update package.json version
    "@semantic-release/npm",

    // Create GitHub release (disabled for local testing)
    // "@semantic-release/github",

    // Commit the version changes back to git
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "package-lock.json", "public/CHANGELOG.md"],
        message: "chore(release): ${nextRelease.version} [skip ci]",
      },
    ],
  ],
};
