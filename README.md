# acmer理财普及录

> 把算法竞赛的严谨，写进你的钱包。

一个由 ACM-ICPC / CCPC 选手自发组成的理财认知交流记录群的作品集单页。收录群内大事记、共享文件库与理财认知图谱。

**仓库**：https://github.com/zhangliwanguiz/acmer-finance-log （源文件托管）
**在线预览**：https://acmer-finance-log.vercel.app/ （生产部署，地址不含 GitHub 用户名）

## 技术栈

纯静态单文件：**HTML + CSS + JavaScript**，零框架、零构建、零依赖。

## 设计规范（Neo-Brutalism）

| 项目 | 约定 |
|---|---|
| 边框 | 2 / 3 / 4px 纯黑实线，统一走 `--b2` `--b3` `--b4` |
| 阴影 | 零模糊硬阴影 `offset offset 0 #000`，取 3 / 5 / 7 / 9px 四档 |
| 禁用 | 无 CSS 渐变、无 blur、无 backdrop-filter |
| 配色 | 热粉 `#FF1493`、电光黄 `#FFE135`、天蓝 `#00BFFF`、青柠绿 `#32CD32`、橙 `#FF6B35`、紫 `#A855F7`，各配淡色底 |
| 基底 | 文字 `#0A0A0A`、页底 `#F5F5F0`、Footer 纯黑 |
| 字体 | Plus Jakarta Sans 800（标题）/ Inter（正文）/ JetBrains Mono（标签与代码） |
| 质感 | 内联 SVG pattern：圆点矩阵、45° 斜条纹、网格、feTurbulence 噪点 |

## 页面结构

1. **Sticky 导航** — 滚动进度条、当前区块高亮、移动端汉堡菜单
2. **Hero** — 蜡烛图面板（A 股配色：红涨绿跌）+ 回测 CLI 代码卡
3. **认知图谱** — 6 项能力进度条，滚动进入视口时动画填充
4. **共享文件库** — 6 列 Bento 网格，8 张异形卡
5. **群内大事记** — 8 条时间线（2023.03 → 2026.06）
6. **关于我们** — 社群资料卡 + 4 条原则
7. **联系 CTA** — 电光黄底，邮箱一键复制
8. **Footer** — 黑底四栏

## 交互与可达性

- **IntersectionObserver**：元素滚动揭示（错峰 60ms）、进度条填充、导航高亮
- **`prefers-reduced-motion`**：关闭平滑滚动与揭示动画，内容直接显形
- **物理按压**：hover 上移 + 阴影放大，active 下移 + 阴影归零
- **可达性**：语义化标签、跳转链接、`:focus-visible` 3px 描边、`aria-label` 覆盖图形元素、Esc 关闭菜单
- 附带打印样式

## 本地预览

直接用浏览器打开 `index.html` 即可，无需服务器。

## 说明

站内文案、数据与人物均为示例内容，可直接替换。所有金融相关表述按「不构成投资建议」口径处理，不代表任何投资意见。
