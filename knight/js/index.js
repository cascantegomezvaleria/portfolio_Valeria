

let subtitle = document.querySelector(".subtitle");
let subtitleText = subtitle.innerHTML
console.log(subtitleText)

let name;
name = prompt("Cual es tu nombre?")
console.log(name)



if(name.length > 12 || name == ''){
    subtitleText = subtitleText
    
}

else if(name.length < 12 && name === "Moises"){
      
     console.log("Viva Messi")
  subtitleText = `${name}, ${subtitleText}`
  
    }

else{
     
  subtitleText = `${name}, ${subtitleText}`
    
}


console.log(subtitleText)
subtitle.innerHTML = subtitleText 

/*const products = [


  {

    id: 1,
    name: "Classic Shield: Oak and Iron",
    price: 45000,
    img src:"Images/shieldofSrDuncan.webp",
    description: " Sr Duncan's shield",
  }
]*/

const gridProducts = document.querySelector('.products-grid');

function loadShields(){
  gridProducts.innerHTML = productsShied.map(products => `
    <article class="product-card">
    <img = ${product.image} alt= "${product.name}>
    <h3>${producto.name}</h3>
      <p class="price">₡${producto.price.toLocaleString()}</p>
      <p>${producto.description}</p>
    </article>
    

 ` )


}

