import "./App.css";
import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    dob: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null); // State to keep track of user being edited

  // Timeout for success and error messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Fetch Users from Database
  const fetchUsers = async () => {
    setLoading(true);
    const API_URL = "http://localhost:3000/users";
    try {
      const res = await axios.get(API_URL);
      setUsers(res.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Form Validation
  const validateForm = () => {
    const { name, email, city, dob } = formData;

    if (!name || !email || !city || !dob) {
      setError("All fields are required.");
      return false;
    }

    // Email validation
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    setError("");
    return true;
  };

  // Add or Update User to Database
  const saveUser = async () => {
    if (!validateForm()) return;

    const URL = editingUserId
      ? `http://localhost:3000/api/update/${editingUserId}` // Update URL if editing
      : "http://localhost:3000/api/save"; // Save URL if adding

    try {
      setLoading(true); // Disable submit button while submitting
      const res = await axios[editingUserId ? "put" : "post"](URL, formData);
      if (res.status === 201 || res.status === 200) {
        setSuccess(
          editingUserId
            ? "User updated successfully!"
            : "User added successfully!"
        );
        setFormData({ name: "", email: "", city: "", dob: "" });
        setEditingUserId(null); // Clear editing state
        fetchUsers();
      }
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setLoading(false); // Enable button after request
    }
  };

  // Edit User and Prefill the Form
  const handleEdit = (user) => {
    setEditingUserId(user.id); // Set the user id to identify it's an edit operation
    setFormData({
      name: user.name,
      email: user.email,
      city: user.city,
      dob: user.dob,
    });
  };

  // Delete User Data
  const deleteUserData = async (userId) => {
    try {
      const DELETE_URL = `http://localhost:3000/api/delete/${userId}`;
      const response = await axios.delete(DELETE_URL);
      if (response.status === 200) {
        setSuccess("User deleted successfully!");
        fetchUsers(); // Refresh the users list
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Error deleting user.");
    }
  };

  // Handle Delete Button Click
  const handleDelete = (userId) => {
    deleteUserData(userId);
  };

  return (
    <>
      <div className="navbar navbar-expand-md bg-body-secondary lg:py-5 md:py-4 sm:py-2">
        <div className="container-fluid d-flex justify-content-center">
          <h2 className="nav-brand md:text-3xl text-2xl font-bold">
            CRUD - Operation Using Node Js and MySQL
          </h2>
        </div>
      </div>

      <div className="container">
        <div className="text-center py-md-4 py-3">
          <h3 className="fs-2">User Registration Form</h3>
        </div>
        <div className="form-container my-2 lg:m-auto p-3 lg:p-0 w-100">
          <form
            action="#"
            className="position-relative"
            autoComplete="off"
            id="registerForm"
          >
            <div className="lg:flex justify-content-around">
              <div className="form-group mb-2">
                <label className="form-label" htmlFor="name">
                  Name
                </label>
                <input
                  className="form-control"
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                />
              </div>
              <div className="form-group mb-2">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="form-control"
                  type="text"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Your email"
                />
              </div>
              <div className="form-group mb-2">
                <label className="form-label" htmlFor="city">
                  City
                </label>
                <input
                  className="form-control"
                  type="text"
                  name="city"
                  id="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Your city"
                />
              </div>
              <div className="form-group mb-2">
                <label className="form-label" htmlFor="dob">
                  Date of Birth
                </label>
                <input
                  className="form-control"
                  type="date"
                  name="dob"
                  id="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="text-center py-3 d-flex justify-content-center align-items-center gap-3">
              <button
                className="btn btn btn-danger btn-sm px-3"
                type="button"
                id="btnClear"
                onClick={() =>
                  setFormData({ name: "", email: "", city: "", dob: "" })
                }
              >
                Clear
              </button>
              <button
                className="btn btn-primary btn-sm px-3"
                type="button"
                id="btnSave"
                onClick={saveUser}
                disabled={loading} // Disable when loading
              >
                {editingUserId ? "Update" : "Submit"}
              </button>
            </div>
            {/* Display Error Message */}
            <div className="alert-message">
              {error ? (
                <div className="text-danger text-center">{error}</div>
              ) : (
                <div className="text-success text-center">{success}</div>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="container">
        <div className="row-count text-end pe-3 py-1"></div>
        <div className=" container px-5 table-container">
          <table
            className="table table-responsive table-hover table-light table-bordered"
            id="userTable"
          >
            <thead className="sticky-top">
              <tr className="text-nowrap text-center">
                <th>Sl No</th>
                <th>Name</th>
                <th>Email</th>
                <th>City</th>
                <th>Date of Birth</th>
                <th colSpan="2">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.city}</td>
                    <td>{user.dob}</td>
                    <td className="d-flex justify-content-center align-items-center gap-3">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEdit(user)} // Set user data for editing
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default App;
