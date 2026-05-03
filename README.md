# 纪念日

> 一个迪士尼烟花城堡风格的纪念日计时应用 —— 记录每一个值得铭记的瞬间。

[在线预览](https://zishuo-xu.github.io/anniversary)

---

## 项目简介

这是一个为情侣打造的纪念日计时器，采用 **迪士尼夜晚烟花城堡** 的梦幻视觉风格。页面中央会实时展示你们在一起的总时长，精确到秒。背景支持自定义照片轮播，每到重要纪念日（第 100 天、200 天、500 天、1000 天……）时，会自动触发一分钟的烟花庆祝，并展示照片回忆轮播，配上浪漫文案。

## 功能亮点

### 核心计时
- 实时展示在一起的总时长，精确到 **年、月、天、时、分、秒**
- 秒级实时更新，数字带有多层金色/粉色/紫色发光阴影
- 底部大字显示当前是 **第 xxx 天**
- 背景有环境光晕跟随数字呼吸脉动

### 迪士尼烟花城堡视觉
- **Canvas 粒子烟花系统**：发射器升空 → 爆炸散开 → 粒子受重力下落 → 拖尾渐隐
- 庆祝模式下烟花密度提升 10 倍，金色粒子为主，带二次爆炸和闪光光晕
- **SVG 城堡剪影**：渐变填充，7 扇窗户独立呼吸发光，尖塔顶有金色光环
- **180 颗随机星星**：独立位置、大小、闪烁频率，营造星空氛围
- 多层渐变叠加，营造深邃夜空

### 自定义照片背景
- 支持上传多张自定义照片作为轮播背景
- 每张照片应用 **Ken Burns 缓慢缩放** 动画
- 8 秒间隔自动切换，3 秒淡入淡出过渡
- 夜间暗角叠加，确保文字始终清晰可读

### 重要纪念日庆祝
- 自动检测第 100、200、300……天的跨越瞬间
- **第一阶段（0~10 秒）**：中央浮现毛玻璃卡片，展示「xxx 天」，带入场/退场动画和呼吸光晕
- **第二阶段（10~54 秒）**：切换到照片回忆轮播，每张照片配一句浪漫文案，5 秒切换，底部有进度圆点
- 庆祝期间原有计时信息自动隐藏，背景烟花持续绽放
- 没有上传照片时，展示默认浪漫文字

### 设置面板
- 设置纪念日标题、副标题
- 设置起始日期和时间
- 设置署名（如 "Z & Y"）
- 上传/删除背景照片
- 所有设置自动保存到 localStorage
- 手动重新播放庆祝烟花按钮

## 技术栈

| 技术 | 说明 |
|------|------|
| [Vite](https://vitejs.dev/) | 构建工具，极速冷启动 |
| [React 19](https://react.dev/) | UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全 |
| [Tailwind CSS v4](https://tailwindcss.com/) | 原子化 CSS，支持 `@theme` 自定义属性 |
| Canvas 2D API | 粒子烟花、拖尾、闪光特效 |
| CSS @keyframes | 闪烁、浮动、光晕脉动、Ken Burns、入场动画 |

## 项目截图

<!-- 建议在此添加实际运行截图 -->

## 快速开始

```bash
# 克隆项目
git clone https://github.com/zishuo-xu/anniversary.git
cd anniversary

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

构建完成后，`dist/` 目录即为可部署的静态文件。

## 文件结构

```
my-app/
├── public/                 # 静态资源
├── src/
│   ├── components/
│   │   ├── TimeDisplay.tsx      # 核心计时展示组件
│   │   ├── Fireworks.tsx        # Canvas 烟花系统
│   │   ├── CelebrationOverlay.tsx  # 纪念日庆祝卡片 + 照片轮播
│   │   ├── BackgroundSlider.tsx    # 照片背景轮播
│   │   ├── Castle.tsx           # SVG 城堡剪影
│   │   ├── Stars.tsx            # 星空组件
│   │   └── Settings.tsx         # 设置面板
│   ├── hooks/
│   │   └── useTimer.ts          # 实时计时 Hook
│   ├── utils/
│   │   ├── time.ts              # 时间差计算
│   │   └── storage.ts           # localStorage 持久化
│   ├── App.tsx                  # 主应用，图层堆叠
│   ├── main.tsx                 # 入口
│   └── index.css                # 全局样式 + 动画 keyframes
├── index.html
├── vite.config.ts
└── package.json
```

## 自定义配置

所有配置均通过页面右上角的设置按钮进行，数据保存在浏览器 localStorage 中：

| 配置项 | 说明 |
|--------|------|
| 纪念日标题 | 主标题，如「遇见你」 |
| 副标题 | 副标题，如「从见到你的那天」 |
| 起始日期/时间 | 计算纪念日倒推的起点 |
| 署名 | 底部署名，如「Z & Y」 |
| 背景照片 | 支持多选上传，单张不超过 5MB |

## 浏览器兼容

- Chrome / Edge / Safari / Firefox 最新版
- 需要支持 CSS `backdrop-filter`、`mix-blend-mode`、`clamp()` 等现代特性
- 移动端浏览器适配良好

## 许可证

[MIT](LICENSE)
