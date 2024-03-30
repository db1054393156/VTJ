import { createViteConfig } from '@vtj/cli';

const BUILD_TYPE = process.env.BUILD_TYPE || '';

const materials = {
  ui: {
    entry: 'src/ui/index.ts',
    library: 'VtjUIMaterial',
    outDir: 'dist/assets/ui'
  },
  element: {
    entry: 'src/element/index.ts',
    library: 'ElementPlusMaterial',
    outDir: 'dist/assets/element'
  },
  antdv: {
    entry: 'src/antdv/index.ts',
    library: 'AntdvMaterial',
    outDir: 'dist/assets/antdv'
  }
};

function createConfig(name: string) {
  const { entry, library, outDir } = materials[name];
  return createViteConfig({
    library,
    entry,
    outDir,
    lib: true,
    dts: false,
    version: true,
    formats: ['umd'],
    external: ['vue', 'vue-router', '@vtj/base', '@vtj/core']
  });
}

export default createConfig(BUILD_TYPE);
