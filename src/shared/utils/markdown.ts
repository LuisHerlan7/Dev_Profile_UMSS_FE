function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInlineMarkdown(value: string): string {
  let html = escapeHtml(value);

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" />');
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^\*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
  html = html.replace(/(^|[^_])_([^_]+)_(?!_)/g, '$1<em>$2</em>');

  return html;
}

export function renderMarkdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const output: string[] = [];
  let listMode: 'ul' | 'ol' | null = null;
  let inCodeBlock = false;

  const closeList = () => {
    if (listMode) {
      output.push(`</${listMode}>`);
      listMode = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      closeList();
      if (inCodeBlock) {
        output.push('</code></pre>');
      } else {
        output.push('<pre><code>');
      }
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      output.push(`${escapeHtml(line)}\n`);
      continue;
    }

    if (!trimmed) {
      closeList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      output.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const unorderedItem = trimmed.match(/^[-*+]\s+(.*)$/);
    if (unorderedItem) {
      if (listMode !== 'ul') {
        closeList();
        output.push('<ul>');
        listMode = 'ul';
      }
      output.push(`<li>${renderInlineMarkdown(unorderedItem[1])}</li>`);
      continue;
    }

    const orderedItem = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedItem) {
      if (listMode !== 'ol') {
        closeList();
        output.push('<ol>');
        listMode = 'ol';
      }
      output.push(`<li>${renderInlineMarkdown(orderedItem[1])}</li>`);
      continue;
    }

    const blockquote = trimmed.match(/^>\s+(.*)$/);
    if (blockquote) {
      closeList();
      output.push(`<blockquote>${renderInlineMarkdown(blockquote[1])}</blockquote>`);
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      closeList();
      output.push('<hr />');
      continue;
    }

    closeList();
    output.push(`<p>${renderInlineMarkdown(trimmed)}</p>`);
  }

  closeList();

  if (inCodeBlock) {
    output.push('</code></pre>');
  }

  return output.join('');
}
