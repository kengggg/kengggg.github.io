---
title: 'Installing Jekyll on Apple Silicon'
date: 2021-01-02
categories: [tech]
tags: [apple, jekyll]
featured_image: '/images/blog/20210102/jekyll-on-apple-silicon-main-cover.webp'
excerpt: Jekyll is good. Apple Silicon is good. Homebrew is good. But they're not willing to work together peacfully at the moment.
---

![](/images/blog/20210102/jekyll-on-apple-silicon-cover.webp)

I just switched my daily laptop from the ThinkPad X1 Carbon to the one with an Apple Silicon. The transition was __almost__ seamless but Jekyll was not be able to run on the Apple `arm64` architechture. Furtunately, Apple's Rosetta Translation Environment enables running [x86_64][1] code through the command `arch -X86_64`, including Jekyll and friends to work.

This guide works as of January 2nd, 2021.

## Installing Homebrew

[Homebrew][2] is the one currently not fully functioned on `arm64` though ~70% of its formula bottles are now [support][3] the Apple Silicon. 

```zsh
arch -X86_64 brew update && arch -X86_64 brew upgrade
```

## Installing `rbenv`

I don't know much about Ruby and `rbenv` is [one of the recommended methods][4]. I believe this would help reducing library conflict similar to Python's `virtualenv`.

```zsh
# Install rbenv and ruby-build
brew install rbenv

# Set up rbenv integration with your shell
rbenv init
```

I'm using zsh so I need to add the this to `.zshrc`.

```zsh
eval "$(rbenv init -)"
```

Make sure you have the version that is currently suggest by the installation guide.

```zsh
rbenv install 2.7.2
rbenv global 2.7.2
ruby -v
```

Since we're installing Ruby through the `arch -X86_64` the resule of `ruby -v` should be `x86_64` instead of `Universal`.

```zsh
ruby 2.7.2p137 (2020-10-01 revision 5445e04352) [x86_64-darwin20]
```

## Installing Jekyll

Then you can install Jekyll.

```zsh
arch -X86_64 gem install --user-install bundler jekyll
arch -X86_64 bundle update
arch -X86_64 bundle install
```

Everything will work as expected as long as your run them through `arch -X86_64`.

[1]: https://developer.apple.com/documentation/apple_silicon/about_the_rosetta_translation_environment
[2]: https://brew.sh
[3]: https://github.com/Homebrew/brew/issues/10152
[4]: https://jekyllrb.com/docs/installation/macos/