import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CartSidebar from '../Cart/CartSidebar';
import WhatsAppChat from '../WhatsAppChat';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <CartSidebar />
      <WhatsAppChat />
    </div>
  );
};

export default Layout;
