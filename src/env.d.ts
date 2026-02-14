/**
 * 环境类型声明文件
 * 声明 *.vue 文件的类型，使 TypeScript 能够正确识别 Vue 组件
 */

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}
