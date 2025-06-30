#!/bin/sh

# State schema detection pre-commit hook

# Run the state schema detector
npm run state:check

# If the script exits with non-zero code, block the commit
if [ $? -ne 0 ]; then
  echo "❌ Commit blocked due to state schema issues"
  echo "   Please review the changes and decide on migration:"
  echo "   npm run state:check"
  exit 1
fi

echo "✅ State schema check passed"

# Changelog reminder for user-facing changes
if git diff --cached --name-only | grep -q "src/"; then
  echo ""
  echo "📝 Reminder: If this change affects users, please update:"
  echo "   public/CHANGELOG.md under [Unreleased] section"
  echo ""
  echo "Write user-friendly descriptions, not technical details!"
  echo "Example: 'Faster wish calculations' not 'optimize algorithm'"
  echo ""
  echo "Run 'npm run changelog:remind' for more guidance."
  echo ""
fi