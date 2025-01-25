(async () => {

    

    // async function getPdfPageCount(fpt) {
    //     try {
    
    //         const response = await fetch(`/api/Pdfpgs?filePath=${encodeURIComponent(fpth)}`);
    //         const data = await response.json();
            
    //         return(`${data.result}`);
             
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // }

    // let file = document.getElementById("file")

    // let fpth = "/Users/harshavardhan/Documents/PPSresume/UpdatedPDF.pdf"


    // console.log(await getPdfPageCount(fpth));
    let currentPrintType = null
    let pageCount = 0
    let printTypePrice = 1
    let PrintColorPrice = 1
    let Tp = 0
    // let calculatedPrice = 0

    let priceDiv = document.getElementById("price")

    function TotalPrintPrice(pageCount,printTypePrice,PrintColorPrice){
        Tp = ((pageCount)*(printTypePrice)*(PrintColorPrice)).toFixed(2)
        priceDiv.innerText = `Price: ${"Rs "+Tp}`
    }
    function TotalPrintPriceform(pageCount,printTypePrice,PrintColorPrice){
        Tp = ((pageCount)*(printTypePrice)*(PrintColorPrice)).toFixed(2)
        return parseFloat(Tp)
    }

    document.getElementById("file").addEventListener("change", function() {
        const file = this.files[0];

        if (file) {
            const fileReader = new FileReader();
            
            fileReader.onload = function(event) {
                const typedArray = new Uint8Array(event.target.result);

                // Use PDF.js to get the PDF document
                pdfjsLib.getDocument(typedArray).promise.then(pdf => {
                   pageCount = pdf.numPages; // Get the number of pages
                   console.log(pageCount);
                //    priceDiv.innerText = `Price: ${"Rs "+TotalPrintPrice(pageCount,printTypePrice,PrintColorPrice)}`
                TotalPrintPrice(pageCount,printTypePrice,PrintColorPrice)
                
                }).catch(error => {
                    console.error('Error loading PDF:', error);
                });
            };

            // Read the file as an ArrayBuffer
            fileReader.readAsArrayBuffer(file);
        }
    });


     // Event listener for print type selection
     const printTypeRadios = document.querySelectorAll('input[name="color"]');
     printTypeRadios.forEach(radio => {
         radio.addEventListener('change', function() {
             currentPrintType = this.value; // Get the value of the selected radio button
             console.log(`Selected print type: ${currentPrintType}`);
             
             if(currentPrintType=="blackAndWhite"){
                printTypePrice = 1
             }
             else if(currentPrintType=="color"){
                printTypePrice = 5
             }
             // Recalculate and display price
             TotalPrintPrice(pageCount,printTypePrice,PrintColorPrice)
           
         });
     });



// on form submit
document.getElementById('addCartForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission


    // Get other form values
    const fileInput = document.getElementById('file').files[0];
    const color = document.querySelector('input[name="color"]:checked').value;
    const pageMode = document.querySelector('input[name="pageMode"]:checked').value;
    const printBlock = document.querySelector('input[name="printblock"]:checked').value;

    if (!fileInput || !color || !pageMode || !printBlock) {
        alert("Please fill all the fields.");
        return; // Don't submit if any required field is missing
    }


 // calculate price and append

    const calculatedPrice = TotalPrintPriceform(pageCount,printTypePrice,PrintColorPrice)    

    if (isNaN(calculatedPrice)) {
        alert("Invalid price value.");
        return; // Don't submit if the price is invalid
    }

    // Create hidden input for price
    const priceInput = document.createElement('input');
    priceInput.type = 'hidden';
    priceInput.name = 'price';
    priceInput.value = calculatedPrice;
    this.appendChild(priceInput);

    // Submit the form
    this.submit();
});


})();