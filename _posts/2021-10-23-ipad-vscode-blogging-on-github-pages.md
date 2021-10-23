---
title: 'Using iPad and vscode.dev for blogging on Github Pages'
date: 2021-10-23
categories: [blog]
tags: [github, ipad, vscode]
featured_image: '/images/blog/20211023/20211023-main-cover.webp'
excerpt: My note on the workflow for updating the Github Pages blog entirely on iPad.

---

![](/images/blog/20211023/20211023-main-cover.webp)

>TL;DR VS Code + Github Pages is great. iPad hardware is good. iPadOS cripples everything.

My blog's workflow was previously relied on using VS Code on the __computer__ for editing and committing markdown files to Github, which was not conveniently feasible on the iPad. 

Now the VS Code is available as a [web][1], it is possible to merge VS Code and Github workflow together on the iPad.

# Content Editing

I can just open vscode.dev, coonect to Github and editing files in my blog's repository. All of my contents were markdown, so I only need a [Markdown Preview Github Styling][2] extension to help me preview the blog content before I push to the repository.

The only drawback of this is, I couldn't use [the local Jekyll][3] to preview the draft contents before pushing to Github. But only markdown preview is enough.

# Image Editing

On the computer, I used Pixelmator Pro or GIMP to edit the cover images and export them as [WebP][4]. Currently all the program I known as tried was not support exporting my edits to WebP. I'll keep the list updated here:
- Pixelmator Pro for iPad - _does not support WebP export_
- Pixelmator Photo - _does not support WebP export_
- Pixlr - _does not support WebP export_

_Last updated 23/10/2021_

So currently my cover images editing workflow will be, editing -> export to jpeg -> convert to WebP on a random online JPG to WebP converter.

# Publishing to Github Pages

Since VS Code and Github are own by Microsoft, we can expect the harmony between the two. I accidentally close the Safari tab that contain VS Code and the data is still intact. 

The issue is on the iPadOS, which is not designed for the multitasking as I familiar on my computer. It makes adding files to the repository is not as simple as drag-and-drop to the VS Code. I need to _upload_ the file to the destination directory on the VS Code.

[1]: https://code.visualstudio.com/blogs/2021/10/20/vscode-dev
[2]: https://marketplace.visualstudio.com/items?itemName=bierner.markdown-preview-github-styles
[3]: https://keng.blog/blog/jekyll-on-apple-silicon
[4]: https://en.wikipedia.org/wiki/WebP