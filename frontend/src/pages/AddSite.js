import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { Globe, ArrowLeft, Check } from 'lucide-react';

const AddSite = () => {
  const navigate = useNavigate();
  const { addSite, loading, error } = useAnalytics();
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: '',
    ownerEmail: ''
  });
  const [success, setSuccess] = useState(false);
  const [newSite, setNewSite] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const site = await addSite(formData);
      setNewSite(site);
      setSuccess(true);
    } catch (error) {
      console.error('Error adding site:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (success && newSite) {
    return (
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Site Added Successfully!
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your site has been registered and is ready for tracking
            </p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Site Successfully Added
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{newSite.name} ({newSite.domain}) has been registered and is ready to start collecting analytics data.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">1. Add Tracking Code</h4>
              <p className="text-sm text-gray-600 mb-3">
                Copy the tracking code below and add it to your website's HTML, preferably in the &lt;head&gt; section of every page you want to track.
              </p>
              <div className="bg-gray-50 rounded-md p-4 relative">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                  {newSite.trackingCode}
                </pre>
                <button
                  onClick={() => copyToClipboard(newSite.trackingCode)}
                  className="absolute top-2 right-2 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">2. Verify Installation</h4>
              <p className="text-sm text-gray-600">
                After adding the tracking code, visit your website to generate some test data. You should see analytics data appear in your dashboard within a few minutes.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">3. View Analytics</h4>
              <p className="text-sm text-gray-600">
                Once you have some data, you can view detailed analytics and insights in your dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => navigate('/sites')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sites
          </button>
          <button
            onClick={() => navigate(`/sites/${newSite.siteId}`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            View Analytics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <button
            onClick={() => navigate('/sites')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sites
          </button>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Add New Site
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Register a new website to start tracking analytics
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Site Name *
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="My Awesome Website"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              A friendly name for your website
            </p>
          </div>

          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
              Domain *
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="domain"
                id="domain"
                required
                value={formData.domain}
                onChange={handleChange}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="example.com"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              The domain of your website (without http:// or https://)
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1">
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="A brief description of your website..."
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Optional description to help you identify this site
            </p>
          </div>

          <div>
            <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700">
              Owner Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                name="ownerEmail"
                id="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleChange}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="owner@example.com"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Optional email address for notifications and account management
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/sites')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Adding Site...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Add Site
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSite;
