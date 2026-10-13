---
# 複製這個檔案來寫新文章，檔名（不含 .md）就是網址，例如 picoctf-writeup.md → /blog/picoctf-writeup
title: Title
date: 2026-10-13
description: description。
tags: [CTF, writeup]
draft: true # 寫好要發布時改成 false 或整行刪掉
---

這裡開始是內文，用 Markdown 寫。

## 小標題

一般段落，可以有 **粗體**、`行內程式碼`、[連結](https://example.com)。

```python
print("程式碼區塊會自動上色")
```

> 引用區塊

- 清單項目
- 清單項目

如果文章有圖片，把文章改成資料夾：`picoctf-writeup/index.md`，圖片放在同一個資料夾，
然後用 `![圖片說明](./screenshot.png)` 插入，Astro 會自動壓縮。
