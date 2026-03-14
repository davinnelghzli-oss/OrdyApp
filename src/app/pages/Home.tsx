import { Link } from 'react-router';
import { Store, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Home() {
  const { businessInfo } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl mb-4 text-gray-900">Ordy</h1>
          <p className="text-xl text-gray-600">Enterprise Order Management System</p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Management Portal */}
          <Link
            to="/management"
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl mb-2 text-gray-900">Management</h2>
            <p className="text-gray-600">Setup your business, menu, and payment methods</p>
          </Link>

          {/* Order Management */}
          <Link
            to="/orders"
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
              <Store className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-2xl mb-2 text-gray-900">Orders</h2>
            <p className="text-gray-600">
              View and manage incoming orders from customers
            </p>
          </Link>
        </div>

        {businessInfo && (
          <div className="max-w-2xl mx-auto mt-12 bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg mb-2 text-gray-900">Current Business</h3>
            <div className="flex items-center gap-4">
              {businessInfo.logo && (
                <img
                  src={businessInfo.logo}
                  alt={businessInfo.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <p className="text-xl text-gray-900">{businessInfo.name}</p>
                <p className="text-gray-600">{businessInfo.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}