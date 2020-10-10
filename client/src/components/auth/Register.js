import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";

function Register() {

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		password2: ''
	})

	// const {name, email, password, password2} = formData;

	const onChange = e => {
		setFormData({...formData, [e.target.name]: e.target.value})
	}

	const onSubmit = async e => {
		e.preventDefault();

		// if(password !== password2) {
		// 	console.log("Passwords do not match.");
		// } else {
		// 	const newUser = {
		// 		name,
		// 		email,
		// 		password,
		// 		password2
		// 	}

		// 	try {
		// 		const config = {
		// 			headers: {
		// 				"Content-Type": "application/json"
		// 			}
		// 		}

		// 		const body = JSON.stringify(newUser);

		// 		const res = await axios.post("/api/users", body, config);

		// 		console.log(res.data);
		// 	} catch(err) {
		// 		console.log(err.response.data);
		// 	}
		// }

		console.log("success");
	}

	return (
    <Fragment>
      <h1 className="large text-primary">Sign Up</h1>
      <p className="lead">
        <i className="fas fa-user"></i> Create Your Account
      </p>
      <form className="form" onSubmit={e => onSubmit(e)}>
        <div className="form-group">
          <input type="text" placeholder="Name" name="name" onChange={e => onChange(e)} required />
        </div>
        <div className="form-group">
          <input type="email" placeholder="Email Address" name="email" onChange={e => onChange(e)} required />
          <small className="form-text">
            This site uses Gravatar, so if you want a profile image, use a
            Gravatar email
          </small>
        </div>
        <div className="form-group">
          <input type="password" placeholder="Password" minLength="6" name="password" onChange={e => onChange(e)} required />
        </div>
        <div className="form-group">
          <input type="password" placeholder="Confirm Password" minLength="6" name="password2" onChange={e => onChange(e)} required />
        </div>
        <input type="submit" value="Register" className="btn btn-primary" />
      </form>
      <p className="my-1">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </Fragment>
  );
}

export default Register;
