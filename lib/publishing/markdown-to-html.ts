/**
 * Utility to convert blog markdown into clean HTML suitable for Blogger and WordPress post payloads.
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";

  const lines = markdown.split("\n");
  const htmlBlocks: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = "";
  let inList = false;
  let listType: "ul" | "ol" = "ul";

  const closeList = () => {
    if (inList) {
      htmlBlocks.push(listType === "ul" ? "</ul>" : "</ol>");
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code block fences
    if (trimmed.startsWith("```")) {
      closeList();
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = trimmed.replace("```", "").trim();
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        const codeContent = codeBuffer
          .join("\n")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        htmlBlocks.push(
          `<pre><code class="language-${codeLang || "text"}">${codeContent}</code></pre>`
        );
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Empty lines
    if (!trimmed) {
      closeList();
      continue;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      closeList();
      htmlBlocks.push(`<h1>${formatInline(trimmed.replace(/^#\s+/, ""))}</h1>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      closeList();
      htmlBlocks.push(`<h2>${formatInline(trimmed.replace(/^##\s+/, ""))}</h2>`);
      continue;
    }
    if (trimmed.startsWith("### ")) {
      closeList();
      htmlBlocks.push(`<h3>${formatInline(trimmed.replace(/^###\s+/, ""))}</h3>`);
      continue;
    }
    if (trimmed.startsWith("#### ")) {
      closeList();
      htmlBlocks.push(`<h4>${formatInline(trimmed.replace(/^####\s+/, ""))}</h4>`);
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith("> ")) {
      closeList();
      htmlBlocks.push(`<blockquote><p>${formatInline(trimmed.replace(/^>\s+/, ""))}</p></blockquote>`);
      continue;
    }

    // Unordered List
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList || listType !== "ul") {
        closeList();
        htmlBlocks.push("<ul>");
        inList = true;
        listType = "ul";
      }
      htmlBlocks.push(`<li>${formatInline(trimmed.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }

    // Ordered List
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      if (!inList || listType !== "ol") {
        closeList();
        htmlBlocks.push("<ol>");
        inList = true;
        listType = "ol";
      }
      htmlBlocks.push(`<li>${formatInline(orderedMatch[2])}</li>`);
      continue;
    }

    // Standard paragraph
    closeList();
    htmlBlocks.push(`<p>${formatInline(trimmed)}</p>`);
  }

  closeList();
  return htmlBlocks.join("\n");
}

/**
 * Replaces inline markdown (**bold**, *italic*, `code`) with HTML
 */
function formatInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}
