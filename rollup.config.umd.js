import clear from 'rollup-plugin-clear';

export default {
  input: './Engine/instance/Engine.js',
  output: {
    file: 'dist/index.js',
    format: 'umd', //打包文件格式
  },
  plugins: [
    clear({targets: ['dist']}), //清除dist目录
  ],
};