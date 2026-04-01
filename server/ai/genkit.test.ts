import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mocks to avoid initializing the full Genkit instance and making real network calls
vi.mock('genkit/beta', () => ({
    genkit: vi.fn()
}));

vi.mock('@genkit-ai/googleai', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockGoogleAI: any = vi.fn();
    mockGoogleAI.model = vi.fn((modelName) => ({ name: modelName })); // Simulate the model object
    return { googleAI: mockGoogleAI };
});

vi.mock('genkitx-ollama', () => ({
    ollama: vi.fn()
}));

vi.mock('genkitx-groq', () => ({
    groq: vi.fn()
}));

describe('Genkit Config - Multi-LLM Provider', () => {
    beforeEach(() => {
        // Important: Reset modules so the provider 
        // reads process.env again in each test (since it is read at module level upon import)
        vi.resetModules();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('should return Google AI (gemini-2.0-flash) by default if LLM_PROVIDER is missing', async () => {
        vi.stubEnv('LLM_PROVIDER', '');
        const { getActiveModel } = await import('./genkit');
        
        const model = getActiveModel();
        if (typeof model === 'object') {
          expect(model.name).toBe('gemini-2.0-flash');
        } else {
          // If the test expects an object but receives a string due to some failure in config, the test will fail here
          expect(model).toBeInstanceOf(Object);
        }
    });

    it('should return Google AI (gemini-2.0-flash) when LLM_PROVIDER is "google"', async () => {
        vi.stubEnv('LLM_PROVIDER', 'google');
        const { getActiveModel } = await import('./genkit');
        
        const model = getActiveModel();
        if (typeof model === 'object') {
          expect(model.name).toBe('gemini-2.0-flash');
        } else {
          expect(model).toBeInstanceOf(Object);
        }
    });

    it('should return the local ollama model when LLM_PROVIDER is "ollama"', async () => {
        vi.stubEnv('LLM_PROVIDER', 'ollama');
        // We try even overwriting the variable to see if it reads it correctly
        vi.stubEnv('OLLAMA_MODEL', 'llama3-test-model');
        const { getActiveModel } = await import('./genkit');
        
        expect(getActiveModel()).toBe('ollama/llama3-test-model');
    });

    it('should return Llama 3.1 8B on Groq when LLM_PROVIDER is "groq"', async () => {
        vi.stubEnv('LLM_PROVIDER', 'groq');
        const { getActiveModel } = await import('./genkit');
        
        expect(getActiveModel()).toBe('groq/llama-3.1-8b-instant');
    });
});
