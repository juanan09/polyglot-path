import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        // ─── Environment ───────────────────────────────────────
        environment: "node",

        // ─── Test files ────────────────────────────────────────
        include: ["**/*.{test,spec}.{ts,js}"],
        exclude: ["node_modules", ".nuxt", ".output", "dist"],

        // ─── Coverage ──────────────────────────────────────────
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

        // ─── Globals ───────────────────────────────────────────
        globals: true,
    },
});
