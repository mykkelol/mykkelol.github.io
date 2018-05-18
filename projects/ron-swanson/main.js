/* c9 compatibility */
    /* global fetch */
    /* global $ */
    /* global axios */

var url = "https://ron-swanson-quotes.herokuapp.com/v2/quotes";
var quote = document.querySelector("#quote");

/* -------------------------------------- */
/* --------------- XHR ------------------ */
/* -------------------------------------- */

var xhrbtn = document.querySelector("#xhr");

xhrbtn.addEventListener("click", function(){
    var XHR = new XMLHttpRequest();
    XHR.onreadystatechange = function(){
        if (XHR.readyState == 4){
            if (XHR.status == 200){
                var quotes = JSON.parse(XHR.responseText)[0];
                quote.textContent = quotes;
            } else {
            console.log("Error encountered");
            }
        }
    }
    
    XHR.open("GET", url);
    XHR.send();
})

/* -------------------------------------- */
/* -------------- FETCH ----------------- */
/* -------------------------------------- */

var fetchbtn = document.querySelector("#fetch");

fetchbtn.addEventListener("click", function(){
    fetch(url)
    .then(function(response){
        if(!response.ok){
            throw Error(response.status)
        }
        return response;
    })
    .then(function(response){
        return response.json()
        .then(function(parsedData){
            return parsedData[0];
        })
    })
    .then(function(data){
        quote.textContent = data;
    })
    .catch(function(err){
        console.log(err);
    });
});

/* -------------------------------------- */
/* -------------- jQuery ---------------- */
/* -------------------------------------- */

$("#jquery").click(function(){
    $.getJSON(url)
    .done(function(response){
        quote.textContent = response[0];
    })
    .fail(function(err){
        console.log(err);
    })
});

/* -------------------------------------- */
/* --------------- Axios ---------------- */
/* -------------------------------------- */

var axiosbtn = document.querySelector("#axios");

axiosbtn.addEventListener("click", function(){
    axios.get(url)
    .then(function(response){
        quote.textContent = response.data[0];
    })
    .catch(function(err){
        if(err.response){
            console.log("Problem with Response", err.response.status);
        } else if (err.request){
            console.log("Problem with Request");
        } else {
            console.log("Error unrelated to response or request", err.message);
        }
    })
});