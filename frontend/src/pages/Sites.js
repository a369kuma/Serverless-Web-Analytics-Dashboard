import React from 'react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { 
  Globe, 
  Plus, 
  Eye, 
  Users,
  Calendar,
  ExternalLink,
  Copy
} from 'lucide-react';
import { format } from 'date-fns';

const Sites = () => {
  const { sites, loading, error } = useAnalytics();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Loading sites...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Your Sites
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor your tracked websites
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            to="/sites/add"
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Site
          </Link>
        </div>
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No sites</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first website to track.
          </p>
          <div className="mt-6">
            <Link
              to="/sites/add"
              className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Site
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <div key={site.siteId} className="bg-white overflow-hidden shadow rounded-lg card-hover">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Globe className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {site.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {site.domain}
                    </p>
                  </div>
                </div>

                {site.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">{site.description}</p>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {site.stats?.totalEvents || 0}
                    </div>
                    <div className="text-xs text-gray-500">Total Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {site.isActive ? 'Active' : 'Inactive'}
                    </div>
                    <div className="text-xs text-gray-500">Status</div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Created {format(new Date(site.createdAt), 'MMM d, yyyy')}
                </div>

                <div className="mt-6 flex space-x-3">
                  <Link
                    to={`/sites/${site.siteId}`}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Analytics
                  </Link>
                  <button
                    onClick={() => copyToClipboard(site.trackingCode)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    title="Copy tracking code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sites;
