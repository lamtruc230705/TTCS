function addToCart(id){
    cart.push(id);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Đã thêm vào giỏ");
}