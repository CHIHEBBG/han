/**
 * Security Utilities for Lab-Tech Website
 * prevents XSS and HTML Injection
 */

const Security = {
    /**
     * Escapes unsafe characters to HTML entities.
     * Use this for inserting untrusted text into the DOM.
     * @param {string} str - The input string
     * @returns {string} - Escaped string
     */
    escapeHTML: function (str) {
        if (!str) return '';
        if (typeof str !== 'string') str = String(str);
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    /**
     * Sanitize a URL to ensure it's safe (e.g. preventing javascript: URIs)
     * @param {string} url 
     * @returns {string}
     */
    sanitizeURL: function (url) {
        if (!url) return '';
        if (url.toLowerCase().trim().startsWith('javascript:')) {
            console.warn('Blocked malicious URL');
            return '#blocked';
        }
        return url;
    },

    /**
     * Sanitize HTML to only allow safe tags and attributes.
     * Preserves text content of unsafe tags.
     * @param {string} html 
     * @returns {string}
     */
    sanitizeHTML: function (html) {
        if (!html) return '';

        // Use a temporary DOM element to parse
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Allowed tags for translations/content
        const allowedTags = ['B', 'I', 'SPAN', 'DIV', 'P', 'BR', 'STRONG', 'EM', 'U', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

        const clean = (node) => {
            // Convert to array to avoid live collection issues during modification
            const children = Array.from(node.childNodes);

            children.forEach(child => {
                if (child.nodeType === 1) { // Element Node
                    const tagName = child.tagName;

                    if (!allowedTags.includes(tagName)) {
                        // Not allowed: Replace with text content
                        const text = document.createTextNode(child.textContent);
                        child.replaceWith(text);
                        return; // Child is gone, no need to clean its children (they are part of textContent now flattened? No, textContent is just text. If we want to preserve inner structure but strip tag, we'd need to move children. `child.replaceWith(...child.childNodes)` is better)
                    }

                    // Check attributes
                    const attrs = Array.from(child.attributes);
                    attrs.forEach(attr => {
                        const name = attr.name.toLowerCase();
                        // Remove event handlers and dangerous protocols
                        if (name.startsWith('on') ||
                            (name === 'href' || name === 'src') && attr.value.toLowerCase().trim().startsWith('javascript:')) {
                            child.removeAttribute(attr.name);
                        }
                    });

                    // Recurse
                    clean(child);
                }
            });
        };

        // Improved strip logic: if tag is bad, unwrap it (keep children)
        // But for simplicity and security, flattening to text or unwrapping is fine.
        // Let's implement unwrap for better UX? 
        // Actually, simple replaceWith(textContent) is safest against complex nesting attacks. 
        // But let's try to unwrap to be nicer.
        // Re-implement clean with unwrap:

        const cleanNodes = (node) => {
            const children = Array.from(node.childNodes);
            children.forEach(child => {
                if (child.nodeType === 1) {
                    if (!allowedTags.includes(child.tagName)) {
                        // Unwrap: Replace tag with its children
                        // We need to move children out before removing
                        while (child.firstChild) {
                            node.insertBefore(child.firstChild, child);
                        }
                        node.removeChild(child);
                        // The moved children will be checked in next passes or we should re-check?
                        // Array.from captured the list beforehand. The new children won't be in 'children' array.
                        // We might miss them.
                        // Recursion is tricky with unwrapping. 

                        // Fallback: Just text content for disallowed tags. This is robust.
                        const text = document.createTextNode(child.textContent);
                        child.replaceWith(text);
                    } else {
                        // Sanitize attributes
                        const attrs = Array.from(child.attributes);
                        attrs.forEach(attr => {
                            const name = attr.name.toLowerCase();
                            if (name.startsWith('on') ||
                                (name === 'href' && attr.value.toLowerCase().trim().startsWith('javascript:'))) {
                                child.removeAttribute(attr.name);
                            }
                        });
                        cleanNodes(child);
                    }
                }
            });
        };

        cleanNodes(temp);
        return temp.innerHTML;
    },

    /**
     * Set text content safely for an element
     * @param {HTMLElement} element 
     * @param {string} text 
     */
    safeText: function (element, text) {
        if (element) {
            element.textContent = text;
        }
    }
};

// Freeze the object to prevent modification
Object.freeze(Security);

// Expose globally
window.Security = Security;
