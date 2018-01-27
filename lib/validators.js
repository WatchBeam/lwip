const { register } = require('./decree');
const { interpolations, colors, defaults } = require('./defs');

register('color', validateColor);
register('interpolation', validateInterpolation);
register('axes', validateAxes);
register('image', validateImage);
register('raw-buffer-properties', validateRawBufferProperties);

function validateInterpolation(inter) {
  return interpolations.hasOwnProperty(inter);
}

function validateAxes(axes) {
  return ['x', 'y', 'xy', 'yx'].indexOf(axes) !== -1;
}

let Image;
function validateImage(img) {
  Image = Image || require('./Image').Image;
  return img instanceof Image;
}

function validateColor(color) {
  if (typeof color === 'string') {
    if (!colors[color]) return false;
  } else {
    if (color instanceof Array) {
      color = {
        r: color[0],
        g: color[1],
        b: color[2],
        a: color[3],
      };
    }
    let a = color.a;
    if (a !== 0) a = a || defaults.DEF_COLOR_ALPHA; // (don't modify the original color object)
    if (
      color.r != parseInt(color.r) ||
      color.r < 0 ||
      color.r > 255 ||
      color.g != parseInt(color.g) ||
      color.g < 0 ||
      color.g > 255 ||
      color.b != parseInt(color.b) ||
      color.b < 0 ||
      color.b > 255 ||
      a != parseInt(a) ||
      a < 0 ||
      a > 100
    )
      return false;
  }
  return true;
}

function validateRawBufferProperties(p) {
  if (
    p.width !== parseInt(p.width) ||
    p.width <= 0 ||
    p.height !== parseInt(p.height) ||
    p.height <= 0
  )
    return false;
  return true;
}
