import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mocks para evitar inicializar toda la instancia de Genkit y hacer llamadas de red reales
vi.mock('genkit/beta', () => ({
    genkit: vi.fn()
}));

vi.mock('@genkit-ai/googleai', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockGoogleAI: any = vi.fn();
    mockGoogleAI.model = vi.fn((modelName) => ({ name: modelName })); // Simulamos el objeto model
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
        // Importante: Reseteamos los módulos para que el `provider` 
        // lea de nuevo process.env en cada test (ya que se lee a nivel de módulo al importar)
        vi.resetModules();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('debe devolver Google AI (gemini-2.0-flash) por defecto si no hay LLM_PROVIDER', async () => {
        vi.stubEnv('LLM_PROVIDER', '');
        const { getActiveModel } = await import('./genkit');
        
        const model = getActiveModel();
        if (typeof model === 'object') {
          expect(model.name).toBe('gemini-2.0-flash');
        } else {
          // Si el test espera un objeto pero recibe un string por algún fallo en el config, el test fallará aquí
          expect(model).toBeInstanceOf(Object);
        }
    });

    it('debe devolver Google AI (gemini-2.0-flash) cuando LLM_PROVIDER es "google"', async () => {
        vi.stubEnv('LLM_PROVIDER', 'google');
        const { getActiveModel } = await import('./genkit');
        
        const model = getActiveModel();
        if (typeof model === 'object') {
          expect(model.name).toBe('gemini-2.0-flash');
        } else {
          expect(model).toBeInstanceOf(Object);
        }
    });

    it('debe devolver el modelo local de ollama cuando LLM_PROVIDER es "ollama"', async () => {
        vi.stubEnv('LLM_PROVIDER', 'ollama');
        // Probamos incluso a machacar la variable para ver si la lee bien
        vi.stubEnv('OLLAMA_MODEL', 'llama3-test-model');
        const { getActiveModel } = await import('./genkit');
        
        expect(getActiveModel()).toBe('ollama/llama3-test-model');
    });

    it('debe devolver Llama 3.1 8B en Groq cuando LLM_PROVIDER es "groq"', async () => {
        vi.stubEnv('LLM_PROVIDER', 'groq');
        const { getActiveModel } = await import('./genkit');
        
        expect(getActiveModel()).toBe('groq/llama-3.1-8b-instant');
    });
});
