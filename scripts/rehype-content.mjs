// Apply presentation at build time so articles work without browser-side rewriting.
export default function rehypeContent() {
  return (tree, file) => {
    const tableLabel = file?.data?.astro?.frontmatter?.lang === 'th' ? 'ตารางที่เลื่อนในแนวนอนได้' : 'Scrollable table';
    let firstLevel = 6;
    function findHeadings(node) {
      if (/^h[1-6]$/.test(node.tagName || '')) firstLevel = Math.min(firstLevel, Number(node.tagName[1]));
      for (const child of node.children || []) findHeadings(child);
    }
    findHeadings(tree);
    const headingOffset = 2 - firstLevel;
    function enhance(parent) {
      if (!parent.children) return;
      parent.children = parent.children.map((node) => {
        enhance(node);
        if (node.type !== 'element') return node;
        if (/^h[1-6]$/.test(node.tagName)) node.tagName = `h${Math.min(6, Number(node.tagName[1]) + headingOffset)}`;
        if (node.tagName === 'img') {
          node.properties.loading = 'lazy';
          node.properties.decoding = 'async';
        }
        // Only unwrap standalone images; preserve paragraphs containing text or links.
        if (node.tagName === 'p' && node.children.length === 1 && node.children[0].tagName === 'img') {
          node.tagName = 'div';
          node.properties.className = ['image-wrap'];
        }
        if (node.tagName === 'iframe' && /youtube(?:-nocookie)?\.com|vimeo\.com/.test(String(node.properties.src))) {
          const width = Number(node.properties.width) || 16;
          const height = Number(node.properties.height) || 9;
          node.properties.loading = 'lazy';
          return { type: 'element', tagName: 'div', properties: { className: ['video-wrap'] }, children: [
            { type: 'element', tagName: 'div', properties: { className: ['video'], style: `padding-bottom: ${height / width * 100}%` }, children: [node] },
          ] };
        }
        if (node.tagName === 'table') {
          return { type: 'element', tagName: 'div', properties: { className: ['table-wrap'], tabIndex: 0, role: 'region', ariaLabel: tableLabel }, children: [node] };
        }
        return node;
      });
    }
    enhance(tree);
  };
}
