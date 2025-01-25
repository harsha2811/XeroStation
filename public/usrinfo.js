(async() =>{

    const usrResponse = await fetch("/usrinfo")
    const usrinfo = await usrResponse.json()
    console.log(usrinfo);

    let side = document.getElementById("side")
    side.innerHTML = side.innerHTML+ `
    <span>${usrinfo.rollnum}</span> <br>
    <span>${usrinfo.studentName}</span>
        <form action="/logout" method="get">
            <button type="submit">Logout</button>
        </form>
    `
    
})();