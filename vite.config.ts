import { defineConfig } from 'vite';
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    target: "es2015",
    lib: {
      entry: "src/index.ts",
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['axios']
    }
  },
  plugins: [
    dts({ insertTypesEntry: true }),
  ]
});

// export default defineConfig({
//   build: {
//     target: "es2015",
//     lib: {
//       entry: "sourcemap.ts",
//       formats: ['cjs'],
//     },
//     rollupOptions: {
//       external: ['axios']
//     }
//   },
//   plugins: [
//     { name: "test", generateBundle(_, bundle) { const code = (Object.values(bundle).find(o => o.type === "chunk") as any).code; console.log(JSON.stringify(code)); console.log(code); } }
//   ]
// });
