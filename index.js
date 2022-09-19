const fs = require("fs");
const readline = require("readline");
const path = require("path");

let filename = "";
let data = [];
let totalQuantity = {};
let mostPopular = {};
let firstFilenameText = "";
let secondFileNameText = "";

// creating a readable stream
const std = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// getting the filename from the user
std.question("Please enter file name to be processed? \r\n", (name) => {
  filename = path.basename(name.trim());
  std.close();
  transformData();
});

// transforming the data from csv to array of objects
function transformData() {
  const reader = readline.createInterface({
    input: fs.createReadStream(filename),
  });

  reader.on("line", (row) => {
    const cellData = row.split(",");
    data.push({
      id: cellData[0],
      area: cellData[1],
      name: cellData[2],
      quantity: cellData[3],
      brand: cellData[4],
    });
  });

  reader.on("close", () => {
    averageQtyPerOrder();
    mostPopularBrand();

    fs.writeFile(`0_${filename}`, firstFilenameText, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`0_${filename} created successfully`);
      }
    });
    fs.writeFile(`1_${filename}`, secondFileNameText, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`1_${filename} created successfully`);
      }
    });
  });
}

// The first filename to get the average number of product type per order
function averageQtyPerOrder() {
  totalQuantity = data.reduce((prev, curr) => {
    return prev[curr.name]
      ? { ...prev, [curr.name]: prev[curr.name] + parseInt(curr.quantity) }
      : { ...prev, [curr.name]: parseInt(curr.quantity) };
  }, {});

  for (let name in totalQuantity) {
    firstFilenameText += `${name}, ${totalQuantity[name] / data.length}\r\n`;
    totalQuantity[name] = totalQuantity[name] / data.length;
  }
}

// The second filename to get the most popular brand  for each product type
function mostPopularBrand() {
  for (let order of data) {
    if (mostPopular[order.name]) {
      if (mostPopular[order.name][order.brand]) {
        mostPopular[order.name][order.brand] += 1;
      } else {
        mostPopular[order.name][order.brand] = 1;
      }
    } else {
      mostPopular[order.name] = {};
      mostPopular[order.name][order.brand] = 1;
    }
  }
  for (let type in mostPopular) {
    let max = 0;
    let brand = "";
    for (let brandName in mostPopular[type]) {
      if (mostPopular[type][brandName] > max) {
        max = mostPopular[type][brandName];
        brand = brandName;
      }
    }
    secondFileNameText += `${type}, ${brand}\r\n`;
    max = 0;
    brand = "";
  }
}
