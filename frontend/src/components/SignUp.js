import React, {useEffect, useState} from "react";
import logo from "../img/logo.png";
import "../css/SignUp.css";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

export default function SignUp() {
  const navigate = useNavigate();
  const[name, setName] = useState("");
  const[email, setEmail] = useState("");
  const[userName, setUserName] = useState("");
  const[password, setPassword] = useState("");

  //toast functions
  const notifyA = (msg) => toast.error(msg);
  const notifyB = () => toast.success("Account created succesfully");

  // regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;

  const postData = () => {
    //checking email
    if(!emailRegex.test(email)){
      return notifyA("Invalid email");
    }
    //check password
    if(!passwordRegex.test(password)){
      return notifyA("password should contain atleast one number and one special character");
    }
    //sending data to server
    fetch("/signup", {
      method : "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        email: email,
        userName: userName,
        password: password
      })
    }).then(res => res.json()).then(data => { 
      if(data.error){
        notifyA(data.error);
      }
      else{
        notifyB(data);
        navigate("/signin");
      }
       
       console.log(data)})
  }
  return (
    <div className="signUp">
      <div className="form-container">
        <div className="form">
          <img className="signUpLogo" src={logo} alt="insta logo" />
          <p className="loginPara">Sign up</p>
          <div>
            <input type="email" name="email" value={email} onChange={(e)=>{setEmail(e.target.value)}} id="email" placeholder="email" />
          </div>
          <div>
            <input type="text" name="name" value={name} onChange={(e) => {setName(e.target.value)}} id="name" placeholder="full name" />
          </div>
          <div>
            <input
              type="text"
              value={userName}
              onChange={(e) => {setUserName(e.target.value)}}
              name="username"
              id="username"
              placeholder="user name"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {setPassword(e.target.value)}}
              name="password"
              id="password"
              placeholder="password"
            />
          </div>
          <p className="loginPara" style={{fontSize: "12px", margin: "3px 0px"}}>
            By signing up, you agree to our terms, <br /> privacy policy and
            cookie policy.
          </p>
          <input type="submit" id="submit-btn" value="Sign up" onClick={() => {postData()}} />
        </div>
        <div className="form2">
          Already have an account?
          <Link to="/signin">
            <span style={{color: "blue", cursor: "pointer"}}> Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
