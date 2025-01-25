(async () => {
//function to convert the date properly 
function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleString(); // Converts to a readable date and time based on local settings
}
    const response1 = await fetch('/admininfo');
    const data1 = await response1.json();
    

   let block = data1.adminname
   if(block =="D-block"){
    document.getElementById("headding").innerText = "D-block shoopkeeper side"
   }
   else if(block =="P-block"){
    document.getElementById("headding").innerText = "P-block shoopkeeper side"
   }
 async function today(day){
       // fetch the cart from the data base and store it in "data" variable
   
       const response = await fetch(`/orders/${day}`);
       const data = await response.json();
   
       if (response.ok) {
           console.log('Order Items:', data.orders);
           // Use data.cart to display the items
       } else {
           console.error('Error:', data.message);
       }
   
   let adminlist = document.getElementById("adminlist")
   adminlist.innerHTML=""
   for (const i in data.orders) {
   if (Object.prototype.hasOwnProperty.call(data.orders, i)) {
       const element = data.orders[i];
       // console.log(element);
       if(block==element.print_block){
       let filenameCryp = element.file
       let cleanFileName = filenameCryp.split('-')[1];
       adminlist.innerHTML = adminlist.innerHTML + 
       `<li  data-message="${element.file}">
            <div id="adminlistcontent">
               <p>Roll number : ${element.roll_number}</p>
               <p>File name : ${cleanFileName}</p> 
              <p>Print Type : ${element.print_type}</p>
              <p>Print Mode :${element.print_mode}</p>
              <p>Print Block : ${element.print_block}</p>
              <p>Price : ${element.price} rs</p>
              <p>Date : ${formatDate(element.order_date)}</p>
              <p class="statusclr" data-sts="${element.status}">Order Status : ${element.status}</p>
           </div>
           <div id="adminlistbtns">
           <button id="open" data-message="${element.file}">Print</button>
           <button id="completed" data-rollnumber="${element.roll_number}" data-file="${element.file}">Completed</button>
           </div>
   
           </li>`
   }}
   }
 }
 await today("today")

//go to today
let gotd = document.getElementById("gotd")
gotd.addEventListener('click', async() => {
    await today("today")
    console.log("went to today");
    //update color fo the status bar

let statusclr = document.getElementsByClassName("statusclr")
    
    for (const element of statusclr) {
        console.log(element.dataset.sts);

        if(element.dataset.sts=="Pending"){
            element.style.backgroundColor = "red"
        }
        else if(element.dataset.sts=="Completed"){
                element.style.backgroundColor = "green"
        }
        
    }

//fuction to open the pdf using end point

let open  = document.querySelectorAll("#open")

open.forEach(element => {
    element.addEventListener('click', async() => {
        console.log(element.dataset.message);
        const pdfUrl = `/pdf/${element.dataset.message}`; 
            window.open(pdfUrl, '_blank');
        
    })

});

let Completed = document.querySelectorAll("#completed");

Completed.forEach(element => {
    element.addEventListener('click', async () => {
        // Ask for confirmation before proceeding
        const confirmUpdate = confirm("Are you sure you want to mark this order as completed?");
        if (!confirmUpdate) {
            return; // Exit if the user cancels the action
        }

        // Get the roll_number and file from the button's data attributes
        const roll_number = element.dataset.rollnumber;
        const file = element.dataset.file;

        try {
            // Make a PUT request to update the order status
            const response = await fetch('/update-order-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roll_number, file }),
            });

            // Handle the response
            const data = await response.json();
            if (response.ok) {
                window.location.href = "/admin.html"; // Redirect after success
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            console.error('Error making request:', err);
            alert('An error occurred while updating the order status.');
        }
    });
});
})

//history code

//go to hstry
let hstry = document.getElementById("hstry")
hstry.addEventListener('click', async() => {
    await today("excludetoday")
    console.log("went to history");
    //update color fo the status bar

let statusclr = document.getElementsByClassName("statusclr")
    
    for (const element of statusclr) {
        console.log(element.dataset.sts);

        if(element.dataset.sts=="Pending"){
            element.style.backgroundColor = "red"
        }
        else if(element.dataset.sts=="Completed"){
                element.style.backgroundColor = "green"
        }
        
    }

//fuction to open the pdf using end point (history)

let open  = document.querySelectorAll("#open")

open.forEach(element => {
    element.addEventListener('click', async() => {
        console.log(element.dataset.message);
        const pdfUrl = `/pdf/${element.dataset.message}`; 
            window.open(pdfUrl, '_blank');
        
    })

});

let Completed = document.querySelectorAll("#completed");

Completed.forEach(element => {
    element.addEventListener('click', async () => {
        // Ask for confirmation before proceeding (history)
        const confirmUpdate = confirm("Are you sure you want to mark this order as completed?");
        if (!confirmUpdate) {
            return; // Exit if the user cancels the action (history)
        }

        // Get the roll_number and file from the button's data attributes (history)
        const roll_number = element.dataset.rollnumber;
        const file = element.dataset.file;

        try {
            // Make a PUT request to update the order status (history)
            const response = await fetch('/update-order-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roll_number, file }),
            });

            // Handle the response (history)
            const data = await response.json();
            if (response.ok) {
                window.location.href = "/admin.html"; // Redirect after success (history)
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            console.error('Error making request:', err);
            alert('An error occurred while updating the order status.');
        }
    });
});
})

//update color fo the status bar

let statusclr = document.getElementsByClassName("statusclr")
    
    for (const element of statusclr) {
        console.log(element.dataset.sts);

        if(element.dataset.sts=="Pending"){
            element.style.backgroundColor = "red"
        }
        else if(element.dataset.sts=="Completed"){
                element.style.backgroundColor = "green"
        }
        
    }

//fuction to open the pdf using end point

let open  = document.querySelectorAll("#open")

open.forEach(element => {
    element.addEventListener('click', async() => {
        console.log(element.dataset.message);
        const pdfUrl = `/pdf/${element.dataset.message}`; 
            window.open(pdfUrl, '_blank');
        
    })

});

let Completed = document.querySelectorAll("#completed");

Completed.forEach(element => {
    element.addEventListener('click', async () => {
        // Ask for confirmation before proceeding
        const confirmUpdate = confirm("Are you sure you want to mark this order as completed?");
        if (!confirmUpdate) {
            return; // Exit if the user cancels the action
        }

        // Get the roll_number and file from the button's data attributes
        const roll_number = element.dataset.rollnumber;
        const file = element.dataset.file;

        try {
            // Make a PUT request to update the order status
            const response = await fetch('/update-order-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roll_number, file }),
            });

            // Handle the response
            const data = await response.json();
            if (response.ok) {
                window.location.href = "/admin.html"; // Redirect after success
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            console.error('Error making request:', err);
            alert('An error occurred while updating the order status.');
        }
    });
});







})();