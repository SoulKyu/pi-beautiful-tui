# pi-beautiful-tui

A polished, multilingual, and themeable terminal UI extension for the [Pi coding agent](https://github.com/earendil-works/pi).

一款为 Pi coding agent 打造的精致、多语言、可切换主题的终端界面扩展。

## Features / 功能

- Thirteen coordinated styles, including OpenTUI, Cyberpunk, Aurora, Jade Ink, Matrix, Industrial, Cosmos, and Mono
- Theme-specific Nerd Font icon packs with safe ASCII fallback
- Custom header, footer, editor frame, progress bar, and working indicator
- Theme-aware editor borders and thinking-level colors, with Pi-native Bash mode preserved
- Session name, working directory, model, provider, context, token, cache-hit, cost, and timer displays
- Per-run telemetry based on OpenTUI semantics: TPS, TTFT, duration, tokens, stream stalls, and cost per million tokens
- Optional extension-status line; hidden by default
- Settings UI in English and Chinese
- No Git subprocesses, repository scanning, runtime probing, or version-detection subprocesses

- 十三套协调主题，包括 OpenTUI、赛博朋克、极光、墨玉、黑客矩阵、工业机械、深空与极简单色
- 每套主题拥有独立 Nerd Font 图标，并提供安全的 ASCII 回退
- 自定义标题、页脚、编辑器边框、进度条与工作动画
- 输入框边框与思维深度颜色随主题联动，同时保留 Pi 原生 Bash 模式颜色
- 显示会话名、工作目录、模型、Provider、上下文、Token、缓存命中率、费用与计时
- 基于 OpenTUI 语义的逐轮性能统计：TPS、TTFT、总耗时、Token、流式停顿及每百万 Token 费用
- 可选扩展状态行，默认关闭
- 设置界面支持中文和英文
- 不运行 Git 子进程，不扫描仓库或运行环境

## Installation / 安装

### npm

```bash
pi install npm:pi-beautiful-tui
```

### GitHub

```bash
pi install git:github.com/smithyyang/pi-beautiful-tui
```

Reload Pi after installation if it is already running:

```text
/reload
```

> Avoid enabling another extension that also replaces Pi's header, footer, or editor at the same time. The last extension to set a component wins.
>
> 请避免同时启用其他会接管 Pi header、footer 或 editor 的扩展，否则最后设置组件的扩展会覆盖前者。

## Settings / 设置

Open the settings overlay:

```text
/pi-beautiful-tui
```

The compatibility alias `/beautiful-tui` is also available.

Settings include:

- Enable or disable the custom UI
- Select language and visual style
- Toggle footer segments, including extension statuses
- Enable telemetry globally or toggle TPS, TTFT, duration, tokens, stalls, and cost independently

配置保存在：

```text
~/.pi/agent/pi-beautiful-tui.json
```

## Styles / 主题

| Style | 中文名 | Character |
|---|---|---|
| OpenTUI | OpenTUI 原版 | Restrained Pi/OpenTUI baseline |
| Cyberpunk | 赛博朋克 | High-contrast cyan and magenta |
| Graffiti | 涂鸦 | Warm, playful, hand-drawn energy |
| Pixel | 像素 | Block geometry and arcade accents |
| Retro CRT | 复古 CRT | Amber terminal and double-line frames |
| Synthwave | 合成波 | Neon purple, pink, and blue |
| Ocean | 海洋 | Cool blue and aqua palette |
| Aurora | 极光 | Cyan, mint, and violet light trails |
| Jade Ink | 墨玉 | Restrained jade green and ink-like lines |
| Matrix | 黑客矩阵 | Phosphor green with binary progress bars |
| Industrial | 工业机械 | Steel gray, warning amber, and heavy frames |
| Cosmos | 深空 | Orbital blue and stellar violet |
| Mono | 极简单色 | Quiet Pi-palette grayscale with minimal ornament |

Nerd Font-capable terminals receive a semantic icon pack tailored to each style. Other terminals automatically receive single-cell ASCII icons. A patched font such as JetBrainsMono Nerd Font or Meslo Nerd Font is recommended.

支持 Nerd Font 的终端会使用各主题专属语义图标；其他终端自动回退为单宽 ASCII 字符。推荐使用 JetBrainsMono Nerd Font 或 Meslo Nerd Font。

## Telemetry / 性能统计

At the end of an agent run, the extension can display:

- Output tokens per second (TPS)
- Time to first token (TTFT)
- Total duration
- Input and output token counts
- Longest stream stall and stall count
- Estimated cost per million tokens

Telemetry is derived only from Pi's local lifecycle events and assistant usage metadata. It does not send analytics or make network requests.

性能统计仅使用 Pi 本地生命周期事件与 assistant usage 数据，不发送分析数据，也不会产生额外网络请求。

## Privacy and side effects / 隐私与副作用

pi-beautiful-tui only changes UI components and stores its own JSON configuration. It does not modify prompts, model requests, context, messages, tools, or session contents. It does not read OAuth credentials.

pi-beautiful-tui 只接管界面组件并保存自身 JSON 配置；不会修改提示词、模型请求、上下文、消息、工具或会话内容，也不会读取 OAuth 凭据。

## Credits

Inspired by [pi-open-tui](https://github.com/OldSuns/pi-open-tui). Portions of the telemetry implementation were adapted from pi-open-tui under the MIT License.

Working-indicator sequences were designed with reference to [cli-spinners](https://github.com/sindresorhus/cli-spinners), also licensed under MIT.

## License

[MIT](./LICENSE)
