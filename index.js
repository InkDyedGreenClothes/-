class ImageCompression {
  constructor(options) {
    this.opt = Object.assign(
      {
        width: 1000,
        LIMIT_SIZE: 0.5 * 1024 * 2014,
        isBase64: true,
      },
      options
    );
    this.callBack = null;
    this.blob = null;
    this.img = null;
    this.orientation = EXIF.getTag(file, "Orientation") || 1;
    this.compressCount = 0;
    this.file = null;
  }
  compression(file, callback) {
    this.file = file;
    this.callBack = callback;
    // 图片压缩出错函数

    if (!window.FileReader) {
      console.error("浏览器不支持 window.FileReader 方法哦");
      callBack(file);
    } else {
      try {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          this.img = new Image();
          this.img.src = reader.result;
          this.img.onload = function () {
            try {
              this.renderCanvas();
            } catch (error) {
              this.errorFn(error);
            }
          };
        };
        reader.onerror = (error) => {
          this.errorFn(error);
        };
      } catch (error) {
        this.errorFn(error);
      }
    }
  }

  renderCanvas() {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    let { width, LIMIT_SIZE } = this.opt;
    const canvasWidth = width;
    let { width: imgWidth, height: imgHeight } = this.img;
    const canvasHeight = canvasWidth / (imgWidth / imgHeight);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    let angle = 0;
    switch (this.orientation) {
      case 1:
        break;
      case 6:
        // 逆时针90°，需要顺时针旋转90°
        angle = (90 * Math.PI) / 180;
        canvas.width = canvasHeight;
        canvas.height = canvasWidth;
        context.rotate(angle);
        context.translate(0, -canvas.width);
        break;
      case 8:
        // 顺时针90°，需要顺时针旋转270°
        angle = (270 * Math.PI) / 180;
        canvas.width = canvasHeight;
        canvas.height = canvasWidth;
        context.rotate(angle);
        context.translate(-canvas.height, 0);
        break;
      case 3:
        // 顺时针180°，需要顺时针旋转180°
        angle = (180 * Math.PI) / 180;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        context.rotate(angle);
        context.translate(-canvas.width, -canvas.height);
        break;
      default:
        break;
    }

    context.drawImage(img, 0, 0, canvasWidth, canvasHeight);
    context.setTransform(1, 0, 0, 1, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob.size > LIMIT_SIZE) {
          this.compressCount += 1;
          imageCompression(blob);
        } else {
          this.compressCount = 0;
          if (isBase64) {
            this.conversion(blob);
          } else {
            callBack(blob);
          }
        }
      },
      "image/jpeg",
      0.9 - this.compressCount * 0.1
    );
  }

  // 转为base64
  conversion(blob) {
    let reader = new FileReader();
    reader.onload = (e) => {
      this.callback(e.target.result);
    };
    reader.readAsDataURL(blob);
  }
  //   错误函数
  errorFn(e) {
    console.error("图片压缩出问题了", e);
    callBack(file);
  }
}
