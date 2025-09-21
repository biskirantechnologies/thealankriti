import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const AdminAnalyticsPage = () => {
  return (
    <>
      <Helmet>
        <title>Analytics - Admin Dashboard</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Reports</h2>
          <p className="text-gray-600">Advanced analytics features coming soon!</p>
        </div>
      </div>
    </>
  );
};

export default AdminAnalyticsPage;