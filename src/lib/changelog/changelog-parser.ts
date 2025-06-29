/**
 * Simple CHANGELOG.md parser
 * Reads the standard CHANGELOG.md file and converts it to our format
 */

import { ChangelogEntry, ChangelogChange } from "./changelog-data";

export async function parseChangelog(): Promise<ChangelogEntry[]> {
  try {
    const response = await fetch('/CHANGELOG.md');
    if (!response.ok) {
      console.warn('CHANGELOG.md not found');
      return [];
    }
    
    const content = await response.text();
    return parseChangelogContent(content);
  } catch (error) {
    console.warn('Failed to parse CHANGELOG.md:', error);
    return [];
  }
}

function parseChangelogContent(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const lines = content.split('\n');
  
  let currentEntry: Partial<ChangelogEntry> | null = null;
  let currentSection = '';
  
  for (const line of lines) {
    // Match version headers: ## [1.2.3] - 2024-06-29 or ## [Unreleased]
    const versionMatch = line.match(/^## \[([^\]]+)\](?:\s*-\s*(\d{4}-\d{2}-\d{2}))?/);
    if (versionMatch) {
      // Save previous entry
      if (currentEntry && currentEntry.version && currentEntry.changes?.length) {
        entries.push(currentEntry as ChangelogEntry);
      }
      
      // Skip unreleased section
      if (versionMatch[1] === 'Unreleased') {
        currentEntry = null;
        continue;
      }
      
      // Start new entry
      currentEntry = {
        version: versionMatch[1],
        date: formatUserFriendlyDate(versionMatch[2]) || "Recently",
        changes: []
      };
      continue;
    }
    
    // Match section headers: ### Added, ### Changed, ### Fixed
    const sectionMatch = line.match(/^### (.+)/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].toLowerCase();
      continue;
    }
    
    // Match bullet points: - Something was added
    const bulletMatch = line.match(/^- (.+)/);
    if (bulletMatch && currentEntry) {
      const description = bulletMatch[1].trim();
      const type = mapSectionToType(currentSection);
      
      if (type && description) {
        currentEntry.changes = currentEntry.changes || [];
        currentEntry.changes.push({ type, description });
      }
    }
  }
  
  // Save last entry
  if (currentEntry && currentEntry.version && currentEntry.changes?.length) {
    entries.push(currentEntry as ChangelogEntry);
  }
  
  return entries;
}

function mapSectionToType(section: string): ChangelogChange['type'] | null {
  switch (section.toLowerCase()) {
    case 'added': return 'feature';
    case 'changed': return 'improvement';
    case 'improved': return 'improvement';
    case 'fixed': return 'fix';
    case 'removed': return 'breaking';
    default: return null;
  }
}

function formatUserFriendlyDate(dateString?: string): string | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      return "Today";
    } else if (diffDays <= 2) {
      return "Yesterday";
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else if (diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    } else if (diffDays <= 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? "1 month ago" : `${months} months ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  } catch (error) {
    return dateString; // Fallback to original if parsing fails
  }
}