import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { 
  BarChart3, 
  Users, 
  Eye, 
  Globe,
  TrendingUp,
  Calendar,
  ArrowRight,
  Plus
} from 'lucide-react';
import { format, subDays } from 'date-fns';

const Dashboard = () => {
  const { sites, loading, error, fetchAnalytics, analytics } = useAnalytics();
  const [selectedSite, setSelectedSite] = useState(null);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    if (sites.length > 0 && !selectedSite) {
      setSelectedSite(sites[0]);
    }
  }, [sites, selectedSite]);

  useEffect(() => {
    if (selectedSite) {
      const endDate = new Date();
      const startDate = subDays(endDate, parseInt(dateRange.replace('d', '')));
      
      fetchAnalytics(selectedSite.siteId, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        groupBy: 'day'
      });
    }
  }, [selectedSite, dateRange, fetchAnalytics]);

  const getDateRangeLabel = (range) => {
    switch (range) {
      case '1d': return 'Last 24 hours';
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      default: return 'Last 7 days';
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
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
            Analytics Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Monitor your website performance and visitor insights
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            to="/sites/add"
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <Globe className="h-4 w-4 mr-2" />
            Add New Site
          </Link>
        </div>
      </div>

      {/* Site Selector and Date Range */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Site
            </label>
            <select
              value={selectedSite?.siteId || ''}
              onChange={(e) => {
                const site = sites.find(s => s.siteId === e.target.value);
                setSelectedSite(site);
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              {sites.map((site) => (
                <option key={site.siteId} value={site.siteId}>
                  {site.name} ({site.domain})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {!selectedSite ? (
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
        <>
          {/* Summary Cards */}
          {analytics?.summary && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Eye className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Pageviews
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analytics.summary.totalPageviews.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Unique Visitors
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analytics.summary.totalUniqueVisitors.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Avg. Pageviews/Day
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analytics.summary.averagePageviewsPerDay.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Calendar className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Date Range
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {getDateRangeLabel(dateRange)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {analytics?.summary && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {analytics.summary.topPage || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">Top Page</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {analytics.summary.topBrowser || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">Top Browser</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {analytics.summary.topDevice || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">Top Device</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {analytics.summary.topOS || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">Top OS</div>
                </div>
              </div>
            </div>
          )}

          {/* View Detailed Analytics */}
          {selectedSite && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Detailed Analytics for {selectedSite.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    View comprehensive analytics and insights
                  </p>
                </div>
                <Link
                  to={`/sites/${selectedSite.siteId}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                >
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
