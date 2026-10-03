# The Last Check-In / 最后一次入住

A small atmospheric investigation game with **English and Chinese in one interface**.

一个以空间叙事、证据观察和视觉氛围为核心的单机调查游戏。英文与中文共用同一套游戏文件，可在游戏右上角随时切换。

## Play / 运行

Open `index.html` in a modern browser.

直接双击 `index.html` 即可运行，不需要安装依赖，也不需要服务器。

## Language switching / 语言切换

Use the `EN / 中文` buttons in the top-right corner.

- language changes instantly
- current evidence progress is preserved
- an open evidence card switches language in place
- the ending screen can also switch language without restarting

右上角的 `EN / 中文` 可以在游戏过程中随时切换；已经找到的证据、当前调查进度和结局状态都不会重置。

## Files

```text
the-last-check-in/
├── index.html
├── style.css
├── game.js
└── README.md
```

Only one copy of the game logic and one visual scene are maintained. All bilingual text lives in the language dictionaries inside `game.js`.

游戏逻辑和视觉场景都只有一份；中英文文本集中维护在 `game.js` 的语言字典中。
