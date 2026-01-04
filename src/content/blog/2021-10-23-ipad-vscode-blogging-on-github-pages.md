---
title: 'Using iPad and vscode.dev for blogging on Github Pages'
date: 2021-10-23
categories: [blog]
tags: [github, ipad, vscode]
featured_image: '/images/blog/20211023/20211023-main-cover.webp'
excerpt: My note on the workflow for updating the Github Pages blog entirely on iPad.
---

![](/images/blog/20211023/20211023-content-cover.webp)


_TL;DR The combination of VS Code + GitHub Pages works well for blogging, and while iPad hardware is impressive, iPadOS restrictions hamper efficiency._

Previously, my blog's workflow relied on using VS Code on a __computer__ to edit and commit markdown files to GitHub. This process was awkward on an iPad.

With the introduction of the [web-based VS Code][1], merging VS Code and GitHub workflows on an iPad has become a reality.

# Content Editing

Using vscode.dev, I can directly connect to GitHub and edit files in my blog's repository. As all my content is in markdown, a [Markdown Preview GitHub Styling extension][2] allows me to preview blog content before pushing it to the repository. However, the inability to use [local Jekyll][3] to preview draft contents remains a drawback.

# Image Editing

On a computer, I used Pixelmator Pro or GIMP to edit cover images and export them as [WebP][4]. Yet, none of the programs I've tried on the iPad support this feature. For now, my workflow involves editing, exporting to JPEG, and then converting to WebP using an online converter.

# Publishing to Github Pages

The integration of VS Code and GitHub, both owned by Microsoft, generally works smoothly. Even if I accidentally close the Safari tab running VS Code, my data remains safe. The challenge lies in iPadOS, which lacks efficient multitasking features familiar to computer users, making simple tasks like drag-and-drop file additions to VS Code more complex.

[1]: https://code.visualstudio.com/blogs/2021/10/20/vscode-dev
[2]: https://marketplace.visualstudio.com/items?itemName=bierner.markdown-preview-github-styles
[3]: https://keng.blog/blog/jekyll-on-apple-silicon
[4]: https://en.wikipedia.org/wiki/WebP
