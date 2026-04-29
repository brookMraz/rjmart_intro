# Asset guide

This directory still contains exported image names from the original design file.
When replacing assets, prefer descriptive filenames and update references in
`index.html`, `styles/base.css`, or `scripts/feature-data.js`.

Key assets:

- `images/2719b3e33a689b1fbf8936a420e613a2.png`: hero background.
- `images/3eb939e16cb990d3c353a13c28d0bb46.png`: stats icon sprite.
- `images/29f3bbb7d2d276ce3cf586221c9dc9c2.png`: customer coverage map.
- `images/bed6c5d9e327fe053f908bda0a85f97e.png`: supplier section background.
- `images/荣誉.png`: certification image.
- `images/全链路闭环.png`, `images/移动端审批.png`, `images/竞价询价.png`,
  `images/无纸化报销.png`, `images/审批流定制.png`, `images/系统对接.png`,
  `images/危化品管理.png`: feature carousel images.
- Hero intro video is loaded from
  `https://dlfile.rjmart.cn/PVideo/%E9%94%90%E7%AB%9E%E9%87%87%E8%B4%AD%E5%B9%B3%E5%8F%B0%E4%BB%8B%E7%BB%8D%E8%A7%86%E9%A2%91.mp4`.

Replacement workflow:

- Put updated design exports in `/Users/raeouyang/Downloads/开发插图`.
- Run `bash scripts/replace_assets.sh` from the repo root.
- The script replaces the hero image and seven feature carousel images while
  saving the previous versions under `asset/backups/`.
