import React from 'react';
import { Helmet } from 'react-helmet-async';
import AdminOrderManager from './AdminOrderManager';

const AdminOrdersPage = () => {
  return (
    <>
      <Helmet>
        <title>Orders - Admin Dashboard</title>
      </Helmet>
      <AdminOrderManager />
    </>
  );
};

export default AdminOrdersPage;