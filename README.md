# ppimage
  Based on canvas and support IE9+ which can help web front-end development engineer to change image 
#Example
```
  ppimage({
      url: 'images/t.jpg',  // image url
      sx: -10,              // start x
      sy: -10,              // start y
      nw: 400,              // image new width
      nh: 400,              // image new height
      w: 200,               // final image's width
      h:200,                // final image's height
      opacity: 100,         // image opacity
      mode: 1,              // filter mode
      _options: {
          offset: 200,      // filter setting
          divisor: 2        // filter setting
      }
  }, function (_imageData) {
      console.log(_imageData);
  })
```
#Result
<img src="http://fyangstudio.github.io/resource/ppimage_ex_1.jpg" style="width:100%;"/>
#Filter mode

Mode1:  Sharpen              (锐化)  \n
Mode2:  Emboss               (浮雕)  \n
Mode3:  Contrast-enhancement (增加对比度)  \n
Mode4:  Color burn           (颜色加深)  \n
Mode5:  Accented Edges       (强化边缘)  \n
Mode6:  Blur                 (模糊)  \n
Mode7:  Mirror               (镜像)  \n
Mode8:  Brighten             (变亮)  \n
Mode9:  Dark                 (变暗)  \n
Mode10: Grayed               (变灰)  \n
Mode11: Plate                (反色)  \n

#Filter setting
It shows different after you changed offset and divisor,like this
<img src="http://fyangstudio.github.io/resource/ppimage_ex_2.jpg" style="width:100%;"/>
