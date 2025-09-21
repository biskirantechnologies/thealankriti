import React from 'react';
import { Helmet } from 'react-helmet-async';
import AdminCustomerManager from './AdminCustomerManager';

const AdminCustomersPage = () => {
  return (
    <>
      <Helmet>
        <title>Customers - Admin Dashboard</title>
      </Helmet>
      <AdminCustomerManager />
    </>
  );
};

export default AdminCustomersPage;