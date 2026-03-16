import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import sonarjs from "eslint-plugin-sonarjs";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: [".nuxt/", ".output/", ".nitro/", "dist/", "node_modules/", "coverage/"] },
  { 
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], 
    plugins: { js }, 
    extends: ["js/recommended"], 
    languageOptions: { 
      globals: {
        ...globals.browser,
        ...globals.node,
        // Reconocimiento de globales de Nuxt 4
        useHead: "readonly",
        useRuntimeConfig: "readonly",
        navigateTo: "readonly",
        defineNuxtConfig: "readonly",
        definePageMeta: "readonly",
      } 
    } 
  },
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  // @ts-expect-error -- sonarjs types are not fully compatible with eslint defineConfig
  sonarjs.configs.recommended,
  { 
    files: ["**/*.vue"], 
    languageOptions: { parserOptions: { parser: tseslint.parser } } 
  },
  {
    // Las páginas en Nuxt por estándar no necesitan nombres compuestos
    files: ["app/pages/**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off"
    }
  }
]);
