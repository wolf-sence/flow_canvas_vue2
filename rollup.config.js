import typescript from 'rollup-plugin-typescript2';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import rollupDelete from 'rollup-plugin-delete';
import rollupImage from '@rollup/plugin-image';
import rollupTerser from '@rollup/plugin-terser';

// 是否是开发模式
const isDev = process.env.NODE_ENV === 'development';

export default {
  input: 'Flow/Flow.js', // 入口文件
  output: {
    file: 'dist/bundle.js', // 输出文件
    format: 'esm', // 输出模块格式
    sourcemap: isDev, // 是否生成 sourcemap
  },
  plugins: [
    rollupDelete({
      targets: 'dist',
    }),
    rollupImage(),
    resolve(), // 解析 node_modules 模块
    commonjs(), // 转换 CommonJS 为 ES 模块
    typescript({
      useTsconfigDeclarationDir: true,
      clean: true, // 清理缓存，防止旧文件遗留
    }), // TypeScript 支持
    isDev && serve({
      open: true,
      contentBase: ['dist', 'public'], // 服务目录
      port: 3000,
    }),
    isDev && livereload('dist'), // 热更新
    rollupTerser(),
  ],
  treeshake: {
    moduleSideEffects: false,
  },
};
