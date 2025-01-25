(async () => {
    //function to convert the date properly 
    function formatDate(isoDate) {
        const date = new Date(isoDate);
        return date.toLocaleString(); // Converts to a readable date and time based on local settings
    }

    let loader = document.querySelector(".loader");
    // Display the loader before fetching data
    
        loader.style.display = "inline-block"; // Ensure the loader is visible



    // fetch the cart from the data base and store it in "data" variable
   
    const response = await fetch('/orderitems');
    const data = await response.json();

    if (response.ok) {
        console.log('Order Items:', data.orders);
        // Use data.cart to display the items
    } else {
        console.error('Error:', data.message);
    }

let cartlist = document.getElementById("orderlist")
for (const i in data.orders) {
if (Object.prototype.hasOwnProperty.call(data.orders, i)) {
    const element = data.orders[i];
    // console.log(element);
    let filenameCryp = element.file
    let cleanFileName = filenameCryp.split('-')[1];
    cartlist.innerHTML = cartlist.innerHTML + 
    `<li  data-message="${element.file}">
         <div>
            <p>Roll number : ${data.roll_number}</p>
            <p>File name : ${cleanFileName}</p> 
           <p>Print Type : ${element.print_type}</p>
           <p>Print Mode :${element.print_mode}</p>
           <p>Print Block : ${element.print_block}</p>
           <p>Price : ${element.price} rs</p>
           <p>Date : ${formatDate(element.order_date)}</p>
           <p class="statusclrs" data-sts="${element.status}">Order Status : ${element.status}</p>
        </div>
        </li>`
}


}


//update color fo the status bar

let statusclr = document.getElementsByClassName("statusclrs")
    
    for (const element of statusclr) {
        console.log(element.dataset.sts);

        if(element.dataset.sts=="Pending"){
            element.style.backgroundColor = "red"
        }
        else if(element.dataset.sts=="Completed"){
                element.style.backgroundColor = "green"
        }
        
    }

// Hide the loader after the operation is complete
loader.style.display = "none";









})();