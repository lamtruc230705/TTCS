function signup(e){
    e.preventDefault();

    let email = document.getElementById("email").value;
    let pass = document.getElementById("password").value;

    users.push({email:email, password:pass, role:"user"});
    localStorage.setItem("users", JSON.stringify(users));

    alert("Đăng ký thành công");
    window.location.href="login.html";
}

function login(e){
    e.preventDefault();

    let email = document.getElementById("email").value;
    let pass = document.getElementById("password").value;

    let user = users.find(u=>u.email===email && u.password===pass);

    if(user){
        localStorage.setItem("currentUser", JSON.stringify(user));

        if(user.role==="admin"){
            window.location.href="admin/dashboard.html";
        }else{
            window.location.href="index.html";
        }
    }else{
        alert("Sai tài khoản");
    }
}