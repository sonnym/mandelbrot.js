var MAX_ITERATIONS = 500;
var COLORS = ["0;30", "1;30", "0;32", "1;32", "0;34", "1;34", "0;36", "1;36", "1;37", "0;37"]

var columns, rows, zoom, offset_x, offset_y;

function scale_coord(val, max, range_min, range_max, offset) {
  var range = (range_max - range_min) / zoom;
  var origin = Math.floor(max / 2);
  return (range * (val - origin) / max) + offset;
}

function reset() {
  zoom = 1;
  offset_x = -.75;
  offset_y = 0;
}

function render() {
  columns = process.stdout.columns;
  rows = process.stdout.rows - 2;

  var output = "\n";

  for (var row = 0; row < rows; row++) {
    var y0 = scale_coord(row, rows, -1, 1, offset_y);

    for (var column = 0; column < columns; column++) {
      var x0 = scale_coord(column, columns, -2.5, 1, offset_x);
      
      for (var x = 0, y = 0, iteration = 0; x * x + y * y < 4 && iteration < MAX_ITERATIONS; iteration++) {
        var x_tmp = x * x - y * y + x0;
        y = 2 * x * y + y0;
        x = x_tmp;
      }

      output += "\033[" + COLORS[(MAX_ITERATIONS - iteration) % COLORS.length] + "m\u2588";
    }

    output += "\n";
  }

  process.stdout.write(output + "\033[0m\n" + "Move: w,a,s,d Zoom: -/+ , Reset: r, Quit: q.");
}

process.stdout.on("resize", function() { render() });

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on("data", function(data) {
  switch (data.toString()) {
    case "q":
      process.stdout.write("\n");
      process.exit(0);
      break;
    case '+':
      zoom *= 1.1;
      break;
    case "-":
      zoom *= 0.9;
      break;
    case "a":
      offset_x -= 0.2 / zoom;
      break;
    case "d":
      offset_x += 0.2 / zoom;
      break;
    case "w":
      offset_y -= 0.2 / zoom;
      break;
    case "s":
      offset_y += 0.2 /zoom;
      break;
    case "r":
      reset();
      break;
    default:
      return;
  }

  render();
});

reset();
render();

(function loop() { process.nextTick(loop) })();
