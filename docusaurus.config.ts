import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: "vacs docs",
    tagline: "VATSIM ATC Communication System",
    favicon: "img/favicon.ico",

    // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
    future: {
        v4: true, // Improve compatibility with the upcoming Docusaurus v4
    },

    url: "https://docs.vacs.network",
    baseUrl: "/",

    organizationName: "vacs-project",
    projectName: "vacs-project.github.io",

    onBrokenLinks: "throw",

    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },

    presets: [
        [
            "classic",
            {
                docs: {
                    sidebarPath: "./sidebars.ts",
                    routeBasePath: "/",
                    editUrl:
                        "https://github.com/vacs-project/vacs-project.github.io/tree/main/",
                    lastVersion: "current",
                    versions: {
                        current: {
                            label: "2.0.0",
                        },
                    },
                },
                blog: false,
                theme: {
                    customCss: "./src/css/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        colorMode: {
            respectPrefersColorScheme: true,
        },
        navbar: {
            title: "vacs",
            logo: {
                alt: "vacs logo",
                src: "img/vacs.png",
            },
            items: [
                {
                    type: "docsVersionDropdown",
                    position: "left",
                },
                {
                    href: "https://vacs.network",
                    label: "Project page",
                    position: "left",
                },
                {
                    type: "localeDropdown",
                    position: "right",
                },
                {
                    href: "https://discord.gg/yu2nyCKU3R",
                    position: "right",
                    className: "header-discord-link",
                    "aria-label": "Discord server",
                },
                {
                    href: "https://github.com/vacs-project/vacs",
                    position: "right",
                    className: "header-github-link",
                    "aria-label": "GitHub repository",
                },
            ],
        },
        footer: {
            copyright: `© ${new Date().getFullYear()} vacs contributors. Documentation licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
