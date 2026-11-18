# Liquid Aqua 简体中文维护版

Liquid Aqua 是 [Decaid](https://github.com/decentespresso/decaid) 的 WebUI 皮肤。完整功能与安装说明见 [英文说明](README.md)。

## 安装与更新

本分支由 `ethan-yangcheng` 独立维护，基于 [SongPaul/liquid-aqua-skin](https://github.com/SongPaul/liquid-aqua-skin)。当前同步上游 **v1.243.0（49f8250）**，中文版本为 **1.243.0-zh.1**，包含 1,504 个内置中文词条与出液量步进修复。

在 Decaid 主页的皮肤管理中选择 **Install from GitHub Branch**：

- Repository：`ethan-yangcheng/liquid-aqua-skin`
- Branch：`feat/simplified-chinese`

已从此分支安装的用户，在 Decaid 主页 → Web Interface → 右上角菜单 → **Check for updates** 更新，然后重新加载皮肤。若先前安装的是 `fix/simplified-chinese-yield-step` 或 ZIP，请按上方信息重新安装一次，以切换更新来源。不要改为上游仓库或 `main` 分支。

沿用 `liquid-aqua` 皮肤 ID，更新现有 Liquid Aqua，不额外创建一份皮肤。之后的中文更新与修复统一维护在 `feat/simplified-chinese` 分支；更新需要先由维护者同步并测试，不会自动跟随上游。

## 本次更新

- 同步上游的热水按秤重停止、固件更新提示、输入控件、运行性能和 8 英寸平板显示优化。
- 同步曲线独立停止提前量、插件页面与自动流量校准显示，以及目标液重写入运行曲线的逻辑。
- 补齐 52 个新增中文词条，更新 6 处说明，删除 26 个上游弃用词条。
- 出液量按钮按方向移动到下一个 0.5g 刻度：74.6g 点“+”到 75.0g，75.1g 点“−”到 75.0g；直接输入仍可保留一位小数。

## 切换中文

1. 打开皮肤右上角 **⚙ Settings（设置）**。
2. 进入 **General（通用）→ Language（语言）**。
3. 选择 **简体中文**，界面立即切换。

简体中文与英语、韩语一样为内置语言，无需 API 密钥，也不需要联网翻译。选择 **自动** 时，`zh-CN`、`zh-SG`、`zh-Hans` 等简体中文浏览器环境会自动使用中文。此设置取决于浏览器报告的语言，不一定与 Android 系统语言完全一致；未自动切换时可手动选择。

繁体中文仍是独立的 AI 翻译选项。`zh-TW`、`zh-HK`、`zh-MO`、`zh-Hant` 环境会优先使用已生成的繁体翻译；没有繁体翻译时使用英语。明确的 `Hans` / `Hant` 脚本标记优先于地区。

## 汉化范围

- 主界面、配方、压力与流量图表、蒸汽、冲洗和热水。
- 咖啡豆、批次、豆袋照片、磨豆机、刀盘、研磨度与转速。
- 萃取曲线库、曲线编辑器、萃取历史、叠加对比与品饮评价。
- 设置、设备连接、固件与插件提示、手机界面。
- AI 萃取分析、曲线建议和磨豆机查询会要求使用当前界面语言输出。AI 功能本身仍需配置相应服务商的密钥。

已有咖啡豆名称、曲线名称、备注和历史数据不会被批量翻译或修改。品牌、型号、API 字段及计量单位保留原文。插件自身的页面与网关界面由对应项目提供，不属于此皮肤的翻译范围。

已保存的 AI 中文翻译仍会保留，但内置简体中文词条优先显示。无需删除旧缓存。

## 开发分支预览

这是独立维护的中文分支；上游 Release 不用于更新本分支。

在仓库目录启动本地预览：

```bash
python3 -m http.server 8081
```

在浏览器打开 `http://127.0.0.1:8081/`。皮肤会尝试连接同一主机的 `8080` 端口；本机未运行 Decaid 网关时，可以查看界面，但不会显示真实设备或萃取数据。

运行无需网关的翻译检查：

```bash
node tools/test/i18n.cjs
node tools/test/yield-step.cjs
```

检查覆盖词条完整性、评分数组、变量占位符、换行、语言自动识别、手动语言优先级、旧 AI 翻译兼容、回退语言及 JavaScript 语法。真实 Android 平板与 DE1 的操作仍需实机验证。
