# set-mermaid 工具实现总结

## 功能概述

本次实现为老彭项目添加了一个新的工具调用 `set-mermaid`，允许 AI 在页面右侧显示一个 Mermaid 图表面板，用户可以与图表进行交互并选择节点进行追问。

## 实现的功能

### 1. Mermaid 图表面板 (`MermaidPanel.tsx`)

**核心功能：**
- ✅ 使用 Mermaid.js 渲染各种类型的图表（流程图、序列图、类图等）
- ✅ 平滑的动画效果（展开/收起时使用 CSS transition）
- ✅ 支持节点点击选择（0 个或多个）
- ✅ 选中节点的视觉高亮（蓝色边框和背景）
- ✅ 全屏模式切换
- ✅ 错误处理和显示
- ✅ 点击背景清空选择

**动画实现：**
- 使用 CSS `transition-all duration-300 ease-in-out`
- 通过 `opacity` 和 `translate-x` 实现滑入/滑出效果
- 面板从右侧滑入，流畅自然

### 2. 工具定义 (`tools.ts`)

添加了 `setMermaidTool`：
```typescript
{
  name: 'set_mermaid',
  description: '在页面右侧显示一个 Mermaid 图表面板...',
  schema: z.object({
    code: z.string().describe('Mermaid 图表代码...'),
  })
}
```

### 3. 工具调用集成 (`agent.ts`)

- 添加了 `setMermaidCallback` 函数用于设置全局回调
- 在工具调用循环中特殊处理 `set_mermaid` 工具
- 当 AI 调用该工具时，触发回调更新前端状态

### 4. ChatWindow 集成

- 添加了 Mermaid 状态管理（`mermaidState`）
- 在组件挂载时设置 Mermaid 回调
- 将 Mermaid 面板集成到聊天界面右侧
- 传递选中的节点数量给 ChatInput

### 5. ChatInput 增强

- 添加了 `selectedNodeCount` 属性
- 添加了 `onClearNodeSelection` 回调
- 在输入框左侧显示选中的节点数量
- 提供快速清除选择的按钮

### 6. 类型定义 (`types/index.ts`)

添加了 `MermaidState` 接口：
```typescript
export interface MermaidState {
  isOpen: boolean;
  code: string;
  selectedNodes: string[];
}
```

## 技术栈

- **Mermaid.js v11**: 图表渲染库
- **Radix UI**: 使用了项目已有的 Radix UI 组件（通过 shadcn/ui）
- **CSS Transitions**: 实现平滑动画
- **React Hooks**: 状态管理和副作用处理
- **TypeScript**: 类型安全

## 用户体验

### AI 调用流程
1. AI 决定使用图表展示内容
2. 调用 `set_mermaid` 工具，传入 Mermaid 代码
3. 面板从右侧滑出，显示图表
4. AI 在回复中解释图表并邀请用户交互

### 用户交互流程
1. 用户看到图表后，可以点击任意节点
2. 选中的节点会高亮显示（蓝色边框）
3. 输入框上方显示"已选择 X 个节点"
4. 用户可以继续点击其他节点进行多选
5. 用户可以点击"清除选择"或点击图表背景取消选择
6. 用户可以点击全屏按钮放大查看
7. 用户可以点击关闭按钮收起面板

## 支持的图表类型

- ✅ Flowchart（流程图）
- ✅ Sequence Diagram（序列图）
- ✅ Class Diagram（类图）
- ✅ State Diagram（状态图）
- ✅ Entity Relationship Diagram（ER 图）
- ✅ Pie Chart（饼图）
- 以及其他 Mermaid 支持的图表类型

## 文件清单

### 新增文件
- `src/components/MermaidPanel.tsx` - Mermaid 面板组件
- `src/prompts/mermaid-demo.ts` - 演示用提示词
- `MERMAID_USAGE.md` - 使用指南

### 修改文件
- `src/lib/tools.ts` - 添加 set_mermaid 工具
- `src/lib/agent.ts` - 添加工具调用回调
- `src/types/index.ts` - 添加 MermaidState 类型
- `src/components/ChatWindow.tsx` - 集成 Mermaid 面板
- `src/components/ChatInput.tsx` - 显示选中节点数量

## 动画效果

面板的展开和收起使用了平滑的 CSS 动画：

```css
transition-all duration-300 ease-in-out
opacity-0 translate-x-full  /* 收起状态 */
opacity-100 translate-x-0   /* 展开状态 */
```

这确保了：
- 面板从右侧滑入时流畅自然
- 透明度渐变使过渡更加柔和
- 300ms 的持续时间既不会太快也不会太慢

## 节点选择功能

### 实现细节
1. **节点检测**: 使用多种 CSS 选择器适配不同类型的图表
2. **坐标计算**: 相对于 SVG 的坐标系统
3. **事件处理**: 阻止事件冒泡，避免误触发
4. **视觉反馈**: 
   - Hover 时降低透明度
   - 选中时添加蓝色边框和浅色背景
   - 在面板底部显示选中的节点标签

### 选择器列表
```typescript
const selectors = [
  '.node',           // flowchart, stateDiagram
  '.vertex',         // flowchart
  '.actor',          // sequenceDiagram
  '.classGroup',     // classDiagram
  '.entity',         // erDiagram
  '.pieSlice',       // pie
  'g[id^="flowchart"]',
  'g[id^="sequence"]',
  'g[id^="class"]',
];
```

## 错误处理

1. **Mermaid 渲染错误**: 显示错误信息和堆栈跟踪
2. **节点提取失败**: 使用 try-catch 保护，记录警告但不中断
3. **空代码处理**: 不显示面板直到有有效代码

## 性能优化

1. **延迟渲染**: 只在面板打开且代码存在时才渲染
2. **事件清理**: 组件卸载时清理所有事件监听器
3. **状态管理**: 使用 React 状态高效更新 UI

## 测试建议

### 功能测试
1. AI 调用 `set_mermaid` 后面板是否正确显示
2. 点击节点是否能正确选择/取消选择
3. 多选功能是否正常工作
4. 清除选择功能是否正常
5. 全屏模式切换是否正常
6. 关闭面板后重新打开是否正常

### 兼容性测试
1. 不同类型的 Mermaid 图表
2. 复杂图表的性能
3. 移动端响应式布局（如果需要）

### 边界测试
1. 空的 Mermaid 代码
2. 无效的 Mermaid 语法
3. 超大的图表
4. 没有可点击节点的图表

## 未来改进建议

1. **节点搜索**: 添加搜索框快速定位节点
2. **节点过滤**: 根据条件过滤显示的节点
3. **导出功能**: 允许用户导出图表为图片
4. **缩放平移**: 支持手势缩放和拖拽
5. **主题切换**: 支持亮色/暗色主题
6. **历史记录**: 保存查看过的图表历史
7. **分享功能**: 生成图表链接分享给他人

## 使用示例

### AI 调用示例

```json
{
  "name": "set_mermaid",
  "arguments": {
    "code": "flowchart TD\n    A[开始] --> B{条件}\n    B -->|是 | C[结束]\n    B -->|否 | D[继续]\n    D --> B"
  }
}
```

### 用户操作示例

1. AI: "我已经为你生成了一个流程图，展示了整个决策过程。你可以点击图中的任意节点，我会为你详细解释该部分的内容。"
2. [面板从右侧滑出，显示流程图]
3. 用户点击节点 "条件"
4. [输入框上方显示"已选择 1 个节点"]
5. 用户输入: "这个条件判断的具体逻辑是什么？"
6. AI: "这个条件判断检查的是..."

## 总结

本次实现完整地添加了 `set-mermaid` 工具调用功能，包括：
- ✅ 平滑的动画效果
- ✅ 灵活的节点选择（0 个或多个）
- ✅ 直观的 UI 反馈
- ✅ 完整的错误处理
- ✅ 良好的用户体验

所有代码都通过了 TypeScript 类型检查和 Next.js 构建验证，可以立即投入使用。
