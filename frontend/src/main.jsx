import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";

import App from "./App.jsx";
import { CartProvider } from "./cart/CartContext.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(

  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
            <Toaster position="top-right" />

          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
