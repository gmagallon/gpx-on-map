/// <reference types="astro/client" />

interface ImportMetaEnv {
readonly PUBLIC_IGN_KEY: string;
}

interface ImportMeta {
readonly env: ImportMetaEnv;
}