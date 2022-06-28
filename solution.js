// -123 => 3
var solution = (x) => {
  var nagative = x < 0 ? true : false;
  var reverse = 0;
  while(x != 0) {
    var last = x % 10;
    x = parseInt(x / 10);
    reverse = (reverse * 10) + last;
  }
  return nagative ? reverse - reverse*2 : reverse;
}