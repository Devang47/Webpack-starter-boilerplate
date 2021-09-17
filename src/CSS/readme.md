# You can also import Scss file directly into `index.ts` but I'd recommend compiling it into css first.

## Why?
Raw:
  ```css
body{
    background-color: rgb(236, 166, 61);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: fit-content;
    height: 100%;
}
```

Compiled:
```css
body {
  background-color: #eca63d;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
      -ms-flex-direction: column;
          flex-direction: column;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  -webkit-box-pack: center;
      -ms-flex-pack: center;
          justify-content: center;
  width: -webkit-fit-content;
  width: -moz-fit-content;
  width: fit-content;
  height: 100%;
}
```

Use `Live Sass Compiler` to compile
> It compiles Scss to css and also adds prefix for supporting all browsers.