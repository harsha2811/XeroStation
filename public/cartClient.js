(async () => {

    let loader = document.querySelector(".loader");
    // Display the loader before fetching data
    
        loader.style.display = "inline-block"; // Ensure the loader is visible
  
    

// fetch the cart from the data base and store it in "data" variable
   
        const response = await fetch('/cartitems');
        const data = await response.json();

        if (response.ok) {
            console.log('Cart Items:', data.cart);
            // Use data.cart to display the items
        } else {
            console.error('Error:', data.message);
        }
   
let cartlist = document.getElementById("cartlist")
let totPrice = 0
for (const i in data.cart) {
    if (Object.prototype.hasOwnProperty.call(data.cart, i)) {
        const element = data.cart[i];
        // console.log(element);
        let filenameCryp = element.file
        let cleanFileName = filenameCryp.split('-')[1];
        cartlist.innerHTML = cartlist.innerHTML + 
        `<li  data-message="${element.file}">
             <div>
                <p>File name : ${cleanFileName}</p> 
               <p>Print Type : ${element.print_type}</p>
               <p>Print Mode :${element.print_mode}</p>
               <p>Print Block : ${element.print_block}</p>
               <p>Price : ${element.price} rs</p>
            </div>
            <div>
            <button id="deletebtn" data-Filename="${element.file}" data-cleanFileName="${cleanFileName}" >Delete</button>
            </div>
            </li>`
            totPrice = totPrice + element.price
    }
}
let totPriceBtn = document.getElementById("totprice")
totPriceBtn.innerHTML = `Pay ${totPrice} Rs`

// console.log(totPrice);

// Hide the loader after the operation is complete
loader.style.display = "none";

//on clicking indivisual element to access its name and delete it from the database
let x = document.querySelectorAll("#cartlist li #deletebtn")

x.forEach(element => {
    element.addEventListener('click',async (e)=>{
        console.log(element.dataset.filename)
        if (confirm(`Are you sure you want to delete ${element.dataset.cleanfilename}?` )) {
            try {
                const response = await fetch(`/deletecart/${encodeURIComponent(element.dataset.filename)}`, {
                    method: 'DELETE',
                });
                const result = await response.json();
                if (response.ok) {
                    window.location.href = "/cart";
                    alert(result.message);  
                } else {
                    alert(result.error || "Failed to delete the item");
                }
            } catch (err) {
                console.error("Error deleting cart item:", err);
            }

        } else {
            alert("Action canceled!");
        }
    
    })
});

//Razor pay gateway Integration

totPriceBtn.addEventListener('click', () => {
    payNow()
})

async function payNow() {
    const amount = totPrice

    // Create order by calling the server endpoint
    const response = await fetch('/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, currency: 'INR', receipt: 'receipt#1', notes: {} })
    });

    const order = await response.json();

    // Open Razorpay Checkout
    const options = {
      key: '[Your key id]', // Replace with your Razorpay key_id
      amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: order.currency,
      name: 'XeroStation',
      description: 'Test Transaction',
      order_id: order.id, // This is the order_id created in the backend
      callback_url: '/payment-success', // Your success URL
      prefill: {
        name:"Your Name",
        email: 'your.email@example.com', 
        contact: 9876543210,
      },
      theme: {
        color: '#001F3F'
      },
    };



// Call signature validate method
handler: (response)=> {
    fetch('/verify-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
        })
    }).then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
                window.location.href = '/payment-success';
            } else {
                alert('Payment verification failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error verifying payment');
        });
}

    const rzp = new Razorpay(options);
    rzp.open();
  }

})();
