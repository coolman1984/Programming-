/**
 * GeminiClient - Low-level API communication layer
 * 
 * Responsibilities:
 * - API key management
 * - HTTP communication with Gemini API
 * - Response parsing and error handling
 * - JSON extraction utilities
 */

// ============================================================================
// API CONFIGURATION
// ============================================================================

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ============================================================================
// API KEY MANAGEMENT
// ============================================================================

const getGeminiKey = (): string | null => {
    const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    const nodeKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : null;
    const key = viteKey || nodeKey;

    if (key && key.length > 10) {
        console.log('[GeminiClient] API Key loaded ✓');
        return key;
    }
    console.warn('[GeminiClient] API Key not found');
    return null;
};

/**
 * Check if Gemini AI is available (API key configured)
 */
export const isAIAvailable = (): boolean => {
    return getGeminiKey() !== null;
};

// ============================================================================
// CORE API CALL
// ============================================================================

export interface GeminiRequest {
    prompt: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
}

export interface GeminiResponse {
    content: string | null;
    error?: string;
}

/**
 * Make a call to the Gemini API
 */
export const callGeminiAPI = async (request: GeminiRequest): Promise<GeminiResponse> => {
    const apiKey = getGeminiKey();
    if (!apiKey) {
        return { content: null, error: 'API key not configured' };
    }

    try {
        const requestBody: any = {
            contents: [{
                role: 'user',
                parts: [{ text: request.prompt }]
            }],
            generationConfig: {
                temperature: request.temperature ?? 0.7,
                maxOutputTokens: request.maxTokens ?? 16000,
                topP: 0.95
            }
        };

        if (request.systemPrompt) {
            requestBody.systemInstruction = {
                parts: [{ text: request.systemPrompt }]
            };
        }

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[GeminiClient] API error:', response.status, errorText);
            return { content: null, error: `API error: ${response.status}` };
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        console.log(`[GeminiClient] Response: ${content.length} chars`);

        return { content };
    } catch (error) {
        console.error('[GeminiClient] Request failed:', error);
        return { content: null, error: String(error) };
    }
};

// ============================================================================
// JSON UTILITIES
// ============================================================================

/**
 * Clean and parse JSON from AI response text
 * Handles markdown code blocks and malformed JSON
 */
export const cleanAndParseJSON = <T = any>(text: string): T | null => {
    if (!text) return null;

    let cleaned = text.replace(/```json/g, '').replace(/```/g, '');

    const firstOpen = cleaned.indexOf('{');
    if (firstOpen === -1) return null;

    // Find matching closing brace
    let balance = 0;
    let lastClose = -1;
    for (let i = firstOpen; i < cleaned.length; i++) {
        if (cleaned[i] === '{') balance++;
        else if (cleaned[i] === '}') {
            balance--;
            if (balance === 0) {
                lastClose = i;
                break;
            }
        }
    }

    if (lastClose === -1) return null;
    cleaned = cleaned.substring(firstOpen, lastClose + 1);

    try {
        return JSON.parse(cleaned) as T;
    } catch (e) {
        try {
            // Flatten newlines and try again
            const flattened = cleaned.replace(/[\r\n]+/g, ' ');
            return JSON.parse(flattened) as T;
        } catch (e2) {
            console.warn('[GeminiClient] JSON parse failed');
            return null;
        }
    }
};

// ============================================================================
// SIMPLE PROMPT HELPER
// ============================================================================

/**
 * Simple wrapper for text generation without structured response
 */
export const generateText = async (
    prompt: string,
    systemPrompt?: string
): Promise<string | null> => {
    const response = await callGeminiAPI({ prompt, systemPrompt });
    return response.content;
};
