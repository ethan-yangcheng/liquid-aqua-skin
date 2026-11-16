# Liquid Aqua 简体中文支持

Liquid Aqua 是 [Decaid](https://github.com/decentespresso/decaid) 的 WebUI 皮肤。完整功能与安装说明见 [英文说明](README.md)。

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

## 中文版出液量修复

`fix/simplified-chinese-yield-step` 分支包含完整简体中文和出液量步进修复，版本为 `1.230.0-zh.1`。例如：74.6g 点“+”到 75.0g，75.1g 点“−”到 75.0g。已对齐时仍每次调整 0.5g，直接输入仍支持一位小数。

在 Decaid 主页的皮肤安装菜单选择 **Install from GitHub Branch**：

- Repository：`ethan-yangcheng/liquid-aqua-skin`
- Branch：`fix/simplified-chinese-yield-step`

安装后重新打开 Liquid Aqua。皮肤 ID 沿用 `liquid-aqua`，会更新现有 Liquid Aqua，而不会额外创建另一个皮肤。此后“检查更新”会跟踪这个安装来源。原汉化分支 `feat/simplified-chinese` 不包含本修复；从该分支或 ZIP 安装的用户需先按上面的步骤切换来源。

离线回归检查：`node tools/test/yield-step.cjs`。本修复通过代码回归检查，尚待 Android 实机确认。

## 开发分支预览

本分支的修改尚不代表上游 GitHub Release 已包含中文。安装上游正式版本时，请先确认其发布说明是否包含本次改动。

在仓库目录启动本地预览：

```bash
python3 -m http.server 8081
```

在浏览器打开 `http://127.0.0.1:8081/`。皮肤会尝试连接同一主机的 `8080` 端口；本机未运行 Decaid 网关时，可以查看界面，但不会显示真实设备或萃取数据。

运行无需网关的翻译检查：

```bash
node tools/test/i18n.cjs
```

检查覆盖词条完整性、评分数组、变量占位符、换行、语言自动识别、手动语言优先级、旧 AI 翻译兼容、回退语言及 JavaScript 语法。真实 Android 平板与 DE1 的操作仍需实机验证。
