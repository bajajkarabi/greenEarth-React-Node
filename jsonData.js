const fs = require('fs');

let i = 0;
let myArr = [];

module.exports = getMaxId = () => {
  var data = fs.readFileSync('jsonfile.json');
  var myObject = JSON.parse(data);
  //console.log(myObject);

  while (true) {
    if (myObject.table[i]) {
      myArr.push(myObject.table[i].ID);
      i++;
    } else {
      break;
    }
  }
  return Math.max(...myArr) + 1;
};

//console.log(getMaxId());
//console.log(getMaxId());
