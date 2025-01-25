// orders number update script

const response = await fetch('/orderitems');
const data = await response.json();

let ordernum = document.getElementById("ordernum")
ordernum.innerHTML = `${data.orders.length}`