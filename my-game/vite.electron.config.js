import { defineConfig } from "vite";
import electron from "vite-plugin-electron";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
    base: "./",
    build: {
        assetsDir: "assets",
        emptyOutDir: true,
        outDir: "dist",
        target: "esnext",
    },
    plugins: [
        electron([
            {
                entry: "src/electron/main.js",
                vite: {
                    build: {
                        outDir: "dist-electron",
                    },
                },
            },
            {
                entry: "src/electron/preload.js",
                vite: {
                    build: {
                        outDir: "dist-electron",
                    },
                },
            },
        ]),
        viteStaticCopy({
            targets: [
                {
                    src: "src/data/**/*",
                    dest: "data",
                    // vite-plugin-static-copy 4 keeps the whole matched path
                    // under dest, so without this the files land in
                    // data/src/data/ and nothing resolves at /data/.
                    rename: { stripBase: 2 },
                },
            ],
        }),
    ],
});
