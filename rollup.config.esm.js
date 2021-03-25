import clear from 'rollup-plugin-clear';
import { uglify } from 'rollup-plugin-uglify'; // 压缩代码空间

export default {
  input: './Engine/instance/Engine.js',
  output: {
    file: 'dist/index.js',
    format: 'esm', //打包文件格式
  },
  plugins: [
    clear({targets: ['dist']}), //清除dist目录
    uglify(),
  ],
};