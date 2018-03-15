# image-viewer

> 基于React的图片预览组件，适用于移动端

## 简介

本组件实现了图片预览的核心功能，支持手势缩放移动，接口也很简单

## 使用

```js
import {preview} from 'image-viewer';

previewImage({
    width: 300,
    height: 420,
    url: 'https://easyread.nosdn.127.net/pic20171215c9217d26f305491d86f96df8ca4c8824.jpg'
});
```

## 开发

使用storybook集成测试开发工具，`npm run storybook`