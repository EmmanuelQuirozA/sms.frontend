// src/pages/Coffee.js
import React, { useState } from 'react';
import Layout from '../../components/Layout';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardHeader,
  MDBCardBody,
  MDBInput,
  MDBBtn,
  MDBIcon,
  MDBListGroup,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBSpinner
} from 'mdb-react-ui-kit';

const Coffee = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [cart, setCart] = useState([]);

  // Dummy products with an image property
  const products = [
    { 
      id: 1, 
      name: '243 - Burger', 
      price: 5.99,
      image: 'https://t4.ftcdn.net/jpg/04/90/59/73/360_F_490597390_Tcz55Gxb0SbSg7Z73XIwnraSMGf5YMbu.jpg'
    },
    { 
      id: 2, 
      name: '142 - Fries', 
      price: 2.99,
      image: 'https://recipe30.com/wp-content/uploads/2017/06/French-fries-848x477.jpg'
    },
    { 
      id: 3, 
      name: '133 - Soda', 
      price: 1.50,
      image: 'https://thumbs.dreamstime.com/b/soda-oscura-de-restauraci%C3%B3n-burbujeante-129296716.jpg'
    },
    { 
      id: 4, 
      name: '441 - Pizza', 
      price: 3.99,
      image: 'https://www.novachef.es/media/images/pizza-pepperoni.jpg'
    },
    // Add more products as needed...
  ];

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add product to cart and group by product id
  const addToCart = (product) => {
    setCart((prevCart) => {
      // Check if the product already exists in cart
      const index = prevCart.findIndex(item => item.id === product.id);
      if (index !== -1) {
        // Increment quantity
        const updatedCart = [...prevCart];
        updatedCart[index].quantity += 1;
        return updatedCart;
      } else {
        // Add new product with quantity 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const processSale = () => {
    // Placeholder: Implement your process sale logic here.
    alert('Processing sale...');
  };

  // Calculate the grand total from cart items
  const grandTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <Layout pageTitle="Coffee Shop">
      <MDBContainer fluid>
        {/* Header Section: Product Search & Management Access */}
        <MDBRow className="mb-4 align-items-end">
          <MDBCol md="12" className="text-end">
            <MDBBtn color="info" className="me-2">
              <MDBIcon fas icon="chart-line" className="me-1" />
              Sales Reports
            </MDBBtn>
            <MDBBtn color="warning" className="me-2">
              <MDBIcon fas icon="shopping-cart" className="me-1" />
              Orders
            </MDBBtn>
            <MDBBtn color="dark">
              <MDBIcon fas icon="utensils" className="me-1" />
              Menu Management
            </MDBBtn>
          </MDBCol>
        </MDBRow>

        {/* Main POS Section: Product Catalog & Cart */}
        <MDBRow>
          {/* Product Catalog */}
          <MDBCol md="8">
            <MDBCard className="mb-4">
              <MDBCardHeader>
                <MDBRow className="d-flex justify-content-between align-items-center">
                  <MDBCol className="col-auto">
                    <MDBIcon fas icon="th-large" className="me-1" />
                    Product Catalog
                  </MDBCol>
                    
									<MDBCol md="6">
											<MDBInput 
											label="Search Products" 
											value={searchTerm} 
											onChange={(e) => setSearchTerm(e.target.value)} 
											/>
									</MDBCol>
                </MDBRow>
              </MDBCardHeader>
              <MDBCardBody>
                <MDBRow>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <MDBCol key={product.id} md="4" className="mb-3">
                        <MDBCard>
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="img-fluid"
                            style={{ height: '150px', objectFit: 'cover' }}
                          />
                          <MDBCardHeader className="bg-light">
                            <strong>{product.name}</strong>
                          </MDBCardHeader>
                          <MDBCardBody className='pb-1'>
														<MDBRow className="d-flex justify-content-between">
														<MDBCol className="col-auto">
															<p><strong>${product.price.toFixed(2)}</strong></p>
														</MDBCol>
														<MDBCol className="col-auto">
															<MDBBtn size="sm" onClick={() => addToCart(product)}>
																<MDBIcon fas icon="plus" className="me-1" /> Add
															</MDBBtn>
														</MDBCol>
														</MDBRow>
															
                            
                          </MDBCardBody>
                        </MDBCard>
                      </MDBCol>
                    ))
                  ) : (
                    <MDBCol md="12">
                      <p className="text-center text-muted">No products found.</p>
                    </MDBCol>
                  )}
                </MDBRow>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          {/* Cart Section */}
          <MDBCol md="4">
            <MDBCard className="mb-4">
              <MDBCardHeader>
                <MDBIcon fas icon="shopping-cart" className="me-2" />
                Cart
              </MDBCardHeader>
              <MDBCardBody>
                <MDBInput 
                  label="Lookup User" 
                  value={userSearchTerm} 
                  onChange={(e) => setUserSearchTerm(e.target.value)} 
                />
                {cart.length === 0 ? (
                  <p className="mt-3">No items in cart</p>
                ) : (
                  <MDBTable responsive small className="mt-3">
                    <MDBTableHead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </MDBTableHead>
                    <MDBTableBody>
                      {cart.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                                className="me-2 rounded"
                              />
                              <span>{item.name}</span>
                            </div>
                          </td>
                          <td>{item.quantity}</td>
                          <td>${item.price.toFixed(2)}</td>
                          <td>${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                      {/* Grand Total Row */}
                      <tr>
                        <td colSpan="3" className="text-end">
                          <strong>Total:</strong>
                        </td>
                        <td>
                          <strong>${grandTotal.toFixed(2)}</strong>
                        </td>
                      </tr>
                    </MDBTableBody>
                  </MDBTable>
                )}
                <MDBBtn 
                  color="success" 
                  className="mt-3" 
                  block 
                  onClick={processSale} 
                  disabled={cart.length === 0}
                >
                  <MDBIcon fas icon="cash-register" className="me-2" />
                  Process Sale
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </Layout>
  );
};

export default Coffee;
