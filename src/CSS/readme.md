# You can also import CSS file directly into `index.ts` [PostCSS is enabled]

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

After PostCSS:
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
> PostCSS is also enabled for Scss