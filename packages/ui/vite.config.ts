import { createViteConfig } from '@vtj/cli';
const isUmd = !!process.env.UMD;

export default createViteConfig({
  lib: true,
  dts: isUmd ? false : true,
  entry: isUmd ? 'src/install.ts' : 'src/index.ts',
  version: true,
  library: 'VtjUI',
  emptyOutDir: isUmd ? false : true,
  external: isUmd
    ? [
        'vue',
        'vue-router',
        'element-plus',
        '@element-plus/icons-vue', 
        '@vtj/utils',
        '@vtj/icons',
        'echarts'
      ]
    : [
        'vue',
        'vue-router',
        'element-plus',
        '@element-plus/icons-vue',
        '@vueuse/core',
        '@vtj/utils',
        '@vtj/icons',
        'echarts'
      ],
  externalGlobals: isUmd
    ? {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        'element-plus': 'ElementPlus',
        '@element-plus/icons-vue': 'VtjIcons',
        '@vtj/utils': 'VtjUtils',
        '@vtj/icons': 'VtjIcons',
        echarts: 'echarts'
      }
    : undefined,
  formats: isUmd ? ['umd', 'iife'] : ['es', 'cjs']
});
