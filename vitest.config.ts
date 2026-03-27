import { defineVitestConfig } from '@nuxt/test-utils/config'
import { fileURLToPath } from "node:url";

export default defineVitestConfig({
    test: {
        // Habilitamos globals para no tener que importar describe/it en cada test
        globals: true,
        setupFiles: ["./test/setup.ts"],
        // Usamos el entorno oficial de Nuxt para soportar auto-imports (ref, computed, useFetch, etc)
        environment: "nuxt",
        include: ["**/*.{test,spec}.{ts,js}"],
        exclude: ["node_modules", ".nuxt", ".output", "dist"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            reportsDirectory: "./coverage",
            include: ["server/**/*.ts", "app/**/*.ts", "utils/**/*.ts"],
            exclude: [
                "node_modules",
                ".nuxt",
                ".output",
                "dist",
                "**/*.d.ts",
                "**/*.config.ts",
                "**/*.spec.ts",
                "**/*.test.ts",
            ],
        },
    },
    resolve: {
        alias: {
            "~": fileURLToPath(new URL("./app", import.meta.url)),
            "@": fileURLToPath(new URL("./app", import.meta.url)),
            "~~": fileURLToPath(new URL("./", import.meta.url)),
            "@@": fileURLToPath(new URL("./", import.meta.url)),
        },
    },
});
