# The Last Check-In / 最后一次入住 / 最後のチェックイン

A small atmospheric investigation game with **English, Chinese, and Japanese in one interface**.

一个以空间叙事、证据观察和视觉氛围为核心的单机调查游戏。三种语言共用同一套游戏文件，可在游戏过程中随时切换。

## Play / 运行

Open `index.html` in a modern browser.

直接双击 `index.html` 即可运行，不需要安装依赖，也不需要服务器。

## Languages

Use the language controls in the top-right corner:

```text
EN   中文   日本語
```

Switching language does not reset the investigation. Collected evidence, an open evidence card, and the ending state are preserved.

## Language as design

The three versions share the same facts, but they are not intended to sound like literal translations of one another.

- **English** keeps a concise detective/noir tone.
- **中文** uses a more compact case-file rhythm and sharper evidence phrasing.
- **日本語** leans into older hotel vocabulary such as `宿直`, `帳場`, `宿帳`, and `投宿`, with slightly quieter, more restrained narration.

Typography also changes with the selected language so that the interface keeps some of each writing system's natural character.

这也是这个项目以后想保留的原则：**多语言不仅是把同一句话翻译三遍，而是让同一个游戏在不同语言里拥有各自自然的声音。**

## Files

```text
the-last-check-in/
├── index.html
├── style.css
├── game.js
└── README.md
```

Only one copy of the game logic and one visual scene are maintained. All language-specific copy lives in the dictionaries inside `game.js`.
