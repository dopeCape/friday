import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getFileIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const fullName = fileName.toLowerCase();

  if (fullName === 'dockerfile' || fullName === 'dockerfile.dev' || fullName === 'dockerfile.prod') return 'nf-dev-docker';
  if (fullName === 'makefile' || fullName === 'cmakelist.txt' || fullName === 'cmakelists.txt') return 'nf-seti-makefile';
  if (fullName === 'readme' || fullName.startsWith('readme.')) return 'nf-cod-book';
  if (fullName === 'license' || fullName.startsWith('license.')) return 'nf-cod-law';
  if (fullName === 'changelog' || fullName.startsWith('changelog.')) return 'nf-cod-history';
  if (fullName === '.gitignore' || fullName === '.gitattributes') return 'nf-dev-git';
  if (fullName === '.editorconfig') return 'nf-seti-config';
  if (fullName === '.eslintrc' || fullName.startsWith('.eslintrc.')) return 'nf-seti-eslint';
  if (fullName === '.prettierrc' || fullName.startsWith('.prettierrc.')) return 'nf-dev-prettier';
  if (fullName === 'package.json' || fullName === 'package-lock.json') return 'nf-seti-npm';
  if (fullName === 'yarn.lock') return 'nf-seti-yarn';
  if (fullName === 'composer.json' || fullName === 'composer.lock') return 'nf-dev-composer';
  if (fullName === 'cargo.toml' || fullName === 'cargo.lock') return 'nf-dev-rust';
  if (fullName === 'go.mod' || fullName === 'go.sum') return 'nf-seti-go';
  if (fullName === 'gemfile' || fullName === 'gemfile.lock') return 'nf-dev-ruby';
  if (fullName === 'requirements.txt' || fullName === 'setup.py' || fullName === 'pyproject.toml') return 'nf-seti-python';

  switch (extension) {
    // JavaScript/TypeScript
    case 'js':
    case 'mjs':
    case 'cjs':
      return 'nf-seti-javascript';
    case 'jsx':
      return 'nf-seti-react';
    case 'ts':
      return 'nf-seti-typescript';
    case 'tsx':
      return 'nf-seti-react_ts';
    case 'vue':
      return 'nf-seti-vue';
    case 'svelte':
      return 'nf-seti-svelte';

    // Web Technologies
    case 'html':
    case 'htm':
      return 'nf-seti-html';
    case 'css':
      return 'nf-seti-css';
    case 'scss':
    case 'sass':
      return 'nf-seti-sass';
    case 'less':
      return 'nf-seti-less';
    case 'styl':
    case 'stylus':
      return 'nf-seti-stylus';
    case 'pcss':
      return 'nf-seti-postcss';

    // Systems Programming
    case 'c':
      return 'nf-seti-c';
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'c++':
      return 'nf-seti-cpp';
    case 'h':
    case 'hpp':
    case 'hxx':
      return 'nf-seti-h';
    case 'cs':
      return 'nf-seti-csharp';
    case 'go':
      return 'nf-seti-go';
    case 'rs':
      return 'nf-dev-rust';

    // Dynamic Languages
    case 'py':
    case 'pyw':
    case 'pyc':
      return 'nf-seti-python';
    case 'rb':
    case 'erb':
      return 'nf-dev-ruby';
    case 'php':
    case 'phtml':
      return 'nf-seti-php';
    case 'pl':
    case 'pm':
      return 'nf-seti-perl';
    case 'lua':
      return 'nf-seti-lua';
    case 'r':
      return 'nf-seti-r';

    // Mobile Development
    case 'swift':
      return 'nf-dev-swift';
    case 'kt':
    case 'kts':
      return 'nf-seti-kotlin';
    case 'dart':
      return 'nf-seti-dart';

    // JVM Languages
    case 'java':
      return 'nf-dev-java';
    case 'scala':
      return 'nf-seti-scala';
    case 'clj':
    case 'cljs':
    case 'cljc':
      return 'nf-seti-clojure';

    // Functional Languages
    case 'hs':
    case 'lhs':
      return 'nf-seti-haskell';
    case 'fs':
    case 'fsx':
    case 'fsi':
      return 'nf-seti-fsharp';
    case 'ml':
    case 'mli':
      return 'nf-seti-ocaml';
    case 'ex':
    case 'exs':
      return 'nf-seti-elixir';
    case 'erl':
    case 'hrl':
      return 'nf-seti-erlang';
    case 'jl':
      return 'nf-seti-julia';

    // Shell Scripts
    case 'sh':
    case 'bash':
    case 'zsh':
    case 'fish':
      return 'nf-seti-shell';
    case 'ps1':
    case 'psm1':
      return 'nf-seti-powershell';
    case 'bat':
    case 'cmd':
      return 'nf-cod-terminal_cmd';

    // Assembly
    case 'asm':
    case 's':
      return 'nf-seti-asm';

    // Scientific Computing
    case 'm':
      return 'nf-seti-matlab';

    // Data & Config
    case 'json':
    case 'jsonc':
      return 'nf-seti-json';
    case 'xml':
      return 'nf-mdi-xml';
    case 'yml':
    case 'yaml':
      return 'nf-seti-yml';
    case 'toml':
      return 'nf-seti-toml';
    case 'ini':
      return 'nf-seti-config';
    case 'properties':
      return 'nf-seti-properties';
    case 'env':
    case 'envrc':
      return 'nf-seti-config';
    case 'csv':
      return 'nf-cod-graph';
    case 'tsv':
      return 'nf-cod-graph';

    // Database
    case 'sql':
    case 'mysql':
    case 'pgsql':
      return 'nf-dev-database';
    case 'graphql':
    case 'gql':
      return 'nf-seti-graphql';

    // Documentation
    case 'md':
    case 'markdown':
      return 'nf-cod-markdown';
    case 'rst':
      return 'nf-seti-rst';
    case 'adoc':
    case 'asciidoc':
      return 'nf-seti-asciidoc';
    case 'tex':
    case 'latex':
      return 'nf-seti-tex';

    // Build Tools
    case 'gradle':
      return 'nf-seti-gradle';
    case 'maven':
      return 'nf-dev-maven';
    case 'tf':
    case 'tfvars':
      return 'nf-seti-terraform';

    // Text Files
    case 'txt':
    case 'text':
      return 'nf-cod-file_text';
    case 'log':
      return 'nf-cod-output';

    // Archives
    case 'zip':
    case 'tar':
    case 'gz':
    case 'bz2':
    case 'xz':
    case 'rar':
    case '7z':
      return 'nf-cod-file_zip';

    // Documents
    case 'pdf':
      return 'nf-cod-file_pdf';
    case 'doc':
    case 'docx':
      return 'nf-cod-file_word';
    case 'xls':
    case 'xlsx':
      return 'nf-cod-file_excel';
    case 'ppt':
    case 'pptx':
      return 'nf-cod-file_powerpoint';

    // Images
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
    case 'ico':
    case 'bmp':
    case 'tiff':
    case 'tif':
      return 'nf-cod-file_media';

    // Video
    case 'mp4':
    case 'avi':
    case 'mkv':
    case 'mov':
    case 'wmv':
    case 'flv':
    case 'webm':
      return 'nf-cod-device_camera_video';

    // Audio
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
    case 'ogg':
    case 'm4a':
      return 'nf-cod-unmute';

    // Fonts
    case 'ttf':
    case 'otf':
    case 'woff':
    case 'woff2':
    case 'eot':
      return 'nf-cod-symbol_color';

    default:
      return 'nf-cod-file';
  }
};

export const getFolderIcon = (folderName: string, isExpanded: boolean): string => {
  const name = folderName.toLowerCase();

  // Version Control
  if (name === '.git') return 'nf-dev-git';
  if (name === '.github' || name === '.gitlab') return isExpanded ? 'nf-cod-github_action' : 'nf-dev-github_badge';

  // Dependencies
  if (name === 'node_modules') return 'nf-seti-node';
  if (name === 'vendor') return 'nf-cod-package';

  // Build/Output
  if (name === 'dist' || name === 'build' || name === 'out' || name === 'target') return 'nf-cod-file_zip';
  if (name === 'bin' || name === 'binaries') return 'nf-cod-file_binary';

  // Source Code
  if (name === 'src' || name === 'source') return isExpanded ? 'nf-cod-folder_opened' : 'nf-cod-folder';
  if (name === 'lib' || name === 'libs' || name === 'library' || name === 'libraries') return 'nf-cod-library';

  // Web Development
  if (name === 'public' || name === 'static' || name === 'www') return 'nf-cod-globe';
  if (name === 'assets' || name === 'images' || name === 'img' || name === 'media') return 'nf-cod-file_media';
  if (name === 'styles' || name === 'css' || name === 'stylesheets') return 'nf-dev-css3';

  // Architecture Patterns
  if (name === 'components' || name === 'component') return 'nf-cod-symbol_class';
  if (name === 'pages' || name === 'views' || name === 'templates') return 'nf-cod-browser';
  if (name === 'models' || name === 'entities') return 'nf-cod-symbol_structure';
  if (name === 'controllers' || name === 'handlers') return 'nf-cod-symbol_method';
  if (name === 'services' || name === 'service') return 'nf-cod-gear';
  if (name === 'repositories' || name === 'repo' || name === 'data') return 'nf-dev-database';
  if (name === 'middleware') return 'nf-cod-debug_stackframe';
  if (name === 'api' || name === 'routes' || name === 'routing') return 'nf-cod-symbol_interface';

  // React/Frontend Specific
  if (name === 'hooks' || name === 'hook') return 'nf-cod-symbol_event';
  if (name === 'contexts' || name === 'context') return 'nf-cod-symbol_namespace';
  if (name === 'store' || name === 'state' || name === 'redux') return 'nf-cod-database';
  if (name === 'types' || name === 'interfaces' || name === 'typings') return 'nf-seti-typescript';

  // Utilities
  if (name === 'utils' || name === 'utilities' || name === 'helpers' || name === 'tools') return 'nf-cod-tools';
  if (name === 'scripts' || name === 'script') return 'nf-seti-shell';
  if (name === 'config' || name === 'configuration' || name === 'settings') return 'nf-seti-config';

  if (name === 'migrations' || name === 'migrate') return 'nf-cod-arrow_right';
  if (name === 'seeds' || name === 'seeders' || name === 'fixtures') return 'nf-cod-database';

  if (name === 'test' || name === 'tests' || name === '__tests__' || name === 'spec' || name === 'specs') return 'nf-md-test_tube';
  if (name === 'cypress' || name === 'e2e') return 'nf-cod-browser';
  if (name === 'coverage') return 'nf-cod-graph';

  if (name === 'docs' || name === 'documentation' || name === 'doc') return 'nf-cod-book';

  // Temporary/Cache
  if (name === 'temp' || name === 'tmp' || name === 'temporary') return 'nf-cod-clock';
  if (name === 'cache' || name === 'cached') return 'nf-cod-database';
  if (name === 'logs' || name === 'log') return 'nf-cod-output';

  // Mobile Development
  if (name === 'android') return 'nf-dev-android';
  if (name === 'ios') return 'nf-dev-apple';

  // DevOps
  if (name === 'docker' || name === 'containers') return 'nf-dev-docker';
  if (name === 'kubernetes' || name === 'k8s') return 'nf-dev-kubernetes';
  if (name === 'terraform') return 'nf-seti-terraform';

  return isExpanded ? 'nf-cod-folder_opened' : 'nf-cod-folder';
};

