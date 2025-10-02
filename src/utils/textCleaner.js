/**
 * Clean text for voice synthesis
 * Removes markdown, special characters, and formatting symbols
 */
export function cleanTextForSpeech(text) {
    if (!text) return '';
  
    let cleaned = text;
  
    // Remove markdown bold/italic (**, __, *, _)
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // **bold**
    cleaned = cleaned.replace(/__([^_]+)__/g, '$1');     // __bold__
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');     // *italic*
    cleaned = cleaned.replace(/_([^_]+)_/g, '$1');       // _italic_
  
    // Remove markdown headers (# ## ###)
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  
    // Remove markdown links [text](url)
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
    // Remove markdown code blocks (``````)
    cleaned = cleaned.replace(/``````/g, '');
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
    // Remove HTML tags
    cleaned = cleaned.replace(/<[^>]*>/g, '');
  
    // Remove bullet points and list markers
    cleaned = cleaned.replace(/^[\s]*[-*+]\s+/gm, '');
    cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, '');
  
    // Remove special characters that sound bad in speech
    cleaned = cleaned.replace(/[#$%^&<>{}[\]\\|~`]/g, '');
  
    // Replace multiple slashes with "or"
    cleaned = cleaned.replace(/\s*\/\s*/g, ' or ');
  
    // Replace @ with "at"
    cleaned = cleaned.replace(/@/g, ' at ');
  
    // Replace & with "and"
    cleaned = cleaned.replace(/&/g, ' and ');
  
    // Remove quotation marks (keep the text inside)
    cleaned = cleaned.replace(/["']/g, '');
  
    // Remove parentheses (keep the text inside)
    cleaned = cleaned.replace(/[()]/g, '');
  
    // Replace multiple spaces with single space
    cleaned = cleaned.replace(/\s+/g, ' ');
  
    // Replace multiple periods/ellipsis with single period
    cleaned = cleaned.replace(/\.{2,}/g, '.');
  
    // Remove leading/trailing whitespace
    cleaned = cleaned.trim();
  
    // Remove empty lines
    cleaned = cleaned.replace(/\n\s*\n/g, '\n');
  
    return cleaned;
  }
  
  /**
   * Clean text for display (less aggressive)
   * Keeps some formatting for readability
   */
  export function cleanTextForDisplay(text) {
    if (!text) return '';
  
    let cleaned = text;
  
    // Only remove obvious errors or double formatting
    cleaned = cleaned.replace(/\*\*\*\*+/g, '');
    cleaned = cleaned.replace(/____+/g, '');
    
    // Replace multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Trim
    cleaned = cleaned.trim();
  
    return cleaned;
  }
  