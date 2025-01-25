// cart number update script

const response = await fetch('/cartitems');
const data = await response.json();

let cartnum = document.getElementById("cartnum")
cartnum.innerHTML = `${data.cart.length}`