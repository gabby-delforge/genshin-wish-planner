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