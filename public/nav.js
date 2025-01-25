// script for navigation
//code to toggle the side bar


let mainbody = document.getElementById("main")
let sidebar = document.getElementById("side")
let usericon = document.getElementById("usericon")
let closeSidebar =  document.getElementById("closeSideBar")
let toggle = 0

usericon.addEventListener('click', () => {
    if(toggle == 0){
        sidebar.style.left = "5px"
        mainbody.style.filter = "blur(5px)"
        toggle +=1
    }
    else if(toggle == 1){
        sidebar.style.left = "-260px"
        mainbody.style.filter = "blur(0px)"
        toggle -=1
    }

})

closeSidebar.addEventListener('click', () => {
    sidebar.style.left = "-260px"
    mainbody.style.filter = "blur(0px)"
    toggle -=1
})



//navigation code

let cartbtn = document.getElementById("cartbtn")
cartbtn.addEventListener('click', () => {
    window.location.href = "/cart";
})

let homebtn = document.getElementById("homebtn")
homebtn.addEventListener('click', () => {
    window.location.href = "/";
})

let orderbtn = document.getElementById("order")
orderbtn.addEventListener('click', () => {
    window.location.href = "/order";
})