# GasterMMT · 一小片天空

一个浅蓝色、带星屑与花瓣的个人导航页，通往：

- 博客：[blog.gastermmt.top](https://blog.gastermmt.top)
- 音乐播放器：[folia.gastermmt.top](https://folia.gastermmt.top)
- 图床：[img.gastermmt.top](https://img.gastermmt.top)

纯 HTML / CSS / 原生 JavaScript，无框架、无构建步骤，可直接部署到 Vercel。

## 亮点

- 默认跟随系统明暗模式，也可以手动切换并记住选择。
- 访客可以调节整站的主题色相：天空、卡片、按钮、插画和星屑都会一起变化。
- 内置「晴空 / 雾蓝 / 薄荷 / 樱花 / 晚霞 / 星紫」六种预设，以及自由色相滑块。
- 星芒点阵与缓慢飘落的花瓣，可在「外观」里关闭动效；同时遵循 `prefers-reduced-motion`。
- 主站卡片采用「一张宽卡 + 两张方卡」的排版，站点增加时会自然流入网格。
- 手写感中文标题、圆角插画和柔和的空间层次，没有外部图片依赖。

## 本地预览

```bash
python -m http.server 3000
```

然后访问 <http://localhost:3000>。

## 部署到 Vercel

### 通过 Git 导入

1. 把整个目录提交到 GitHub / GitLab 仓库。
2. 在 Vercel 中 **Add New → Project**，导入该仓库。
3. Framework Preset 选择 **Other**；Build Command 与 Output Directory 保持默认或留空。
4. 点击 **Deploy**。项目没有构建步骤，也不需要环境变量。

`vercel.json` 已配置 clean URLs、基础安全响应头和静态资源缓存；`404.html` 会作为自定义 404 页面。

### 通过 Vercel CLI

```bash
npx vercel
npx vercel --prod
```

## 外观设置

| 项目 | localStorage 键 | 说明 |
| --- | --- | --- |
| 明暗模式 | `gastermmt-theme` | `auto`（默认）、`light`、`dark` |
| 主题色相 | `gastermmt-hue` | 0–360 的整数，默认 205 |
| 背景动效 | `gastermmt-effects` | `on`（默认）或 `off` |

- 未做任何设置时完全跟随系统。
- 色相通过 CSS 变量 `--hue` 驱动整个页面。颜色定义位于 `styles.css` 的 `:root`、`:root[data-theme="dark"]` 与 `prefers-color-scheme` 区块。
- 星屑点阵是静态背景，动效关闭后仍然保留；花瓣与闪烁星点会隐藏。
- 如果把 JavaScript 禁用，页面仍会自动跟随系统主题，外观按钮会隐藏。

## 增加新的站点

1. 在 `index.html` 的 `<nav class="site-grid">` 里复制一个 `site-card site-card--small`。
2. 修改链接、分类、标题、描述、标签和域名。
3. 每张卡片都需要保留 `target="_blank"`、`rel="noopener noreferrer"` 和末尾的「在新标签页打开」提示。
4. 新卡片的插画可以用现有 SVG 作为模板；不想要插画时，保留 `.site-art` 会出现空的天色区域，所以最好补一张自己的 SVG。
5. 若新站也基于新的开源项目，请在致谢区补一条 `.credit-link`。

当前第一张 `site-card--featured` 是横向主卡。你可以把另一张卡也加这个类；网格会按行自动排布。站点比较多时，可以继续添加 `.site-card--small`，它们会两两成行。

## 字体

项目自托管三个 SIL Open Font License 字体子集：

- **Noto Sans SC**：正文中文。许可证：`assets/fonts/NotoSansSC-OFL.txt`
- **Outfit**：英文与数字。许可证：`assets/fonts/Outfit-OFL.txt`
- **Sky Hand**：由 [悠哉字体 / Yozai](https://github.com/lxgw/yozai-font) 子集化并改名而来，用于中文标题。保留名称「悠哉 / Yozai」未用于这个衍生子集。许可证：`assets/fonts/Yozai-OFL.txt`

修改中文文案后，重新生成子集：

```bash
pip install fonttools brotli
python tools/build-fonts.py
```

脚本会自动下载缺少的字体源到 `tools/.font-cache/`（已在 git 与 Vercel 上传范围之外）。Windows 上会优先使用系统的 `NotoSansSC-VF.ttf`。

## 文件结构

```text
.
├── index.html                 首页与外观面板
├── 404.html                   自定义 404
├── styles.css                 布局、颜色变量与动效
├── script.js                  主题色、明暗模式、星屑与花瓣
├── vercel.json
├── robots.txt
├── assets/
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── star-mask.svg          星屑点阵遮罩
│   └── fonts/                 三个字体子集与各自的 OFL
└── tools/
    └── build-fonts.py         字体子集生成脚本
```

## 致谢

这些子站分别基于以下开源项目搭建，感谢原作者与所有贡献者：

- [Shirone](https://github.com/LyraVoid/Shirone) — 博客主题，作者 [LyraVoid](https://github.com/LyraVoid)
- [Folia](https://github.com/chthollyphile/folia-major) — 音乐播放器，作者 [chthollyphile](https://github.com/chthollyphile)
- [CloudFlare-ImgBed](https://github.com/MarSeventh/CloudFlare-ImgBed) — 图床程序，作者 [MarSeventh](https://github.com/MarSeventh)

字体来自 [Noto Sans SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC)、[Outfit](https://github.com/Outfitio/Outfit-Fonts) 与 [Yozai](https://github.com/lxgw/yozai-font)，均以 SIL Open Font License 1.1 授权。
