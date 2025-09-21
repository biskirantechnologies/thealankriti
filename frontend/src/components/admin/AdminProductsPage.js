import React from 'react';
import { Helmet } from 'react-helmet-async';
import AdminProductManager from './AdminProductManager';

const AdminProductsPage = () => {
  return (
    <>
      <Helmet>
        <title>Products - Admin Dashboard</title>
      </Helmet>
      <AdminProductManager />
    </>
  );
};

export default AdminProductsPage;