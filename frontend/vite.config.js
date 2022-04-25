// vite.config.js
import { defineConfig } from 'vite'
import vitePluginImp from 'vite-plugin-imp'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        // modifyVars: {
        //   'font-size-base': '1px',
        // },
        javascriptEnabled: true // this is for solving the bug whem importing antd less file(error .bezierEasingMixin (); ^ Inline JavaScript is not enabled Is it set in your options.)
      }
    }
  },
  plugins: [
    vue(),
    vitePluginImp({
      libList: [
        {
          libName: 'ant-design-vue',
          style (name) {
            if (/popconfirm/.test(name)) {
              // support multiple style file path to import
              return [
                'ant-design-vue/es/button/style/index.css',
                'ant-design-vue/es/popover/style/index.css'
              ]
            }
            return `ant-design-vue/es/${name}/style`
          }
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // map '@' to './src'
    }
  },
  build: {
    terserOptions: {
      ecma: 6,
      compress: { drop_console: true },
      output: { comments: false, beautify: false }
    }
  }
})
