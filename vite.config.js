import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

// Helper to get build-time metadata
const getBuildMetadata = () => {
  const isCI = process.env.CF_PAGES === '1' || process.env.GITHUB_ACTIONS === 'true';

  let hash = Math.random().toString(36).substring(2, 7).toUpperCase();
  if (process.env.CF_PAGES_COMMIT_SHA) hash = process.env.CF_PAGES_COMMIT_SHA.substring(0, 7);
  else if (process.env.GITHUB_SHA) hash = process.env.GITHUB_SHA.substring(0, 7);

  let contentDate = new Date().toDateString();
  if (isCI) {
    try {
      const timestamp = execSync('git log -1 --format=%ct -- ./src/content ./src/data').toString().trim();
      if (timestamp) {
        contentDate = new Date(parseInt(timestamp) * 1000).toDateString();
      }
    } catch (e) {
      // Fallback if git history is not available
    }
  }

  return {
    hash,
    buildTime: new Date().toString().slice(0, 24),
    contentDate
  };
};

const metadata = getBuildMetadata();

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_BUILD_INFO': JSON.stringify(metadata)
  }
});
