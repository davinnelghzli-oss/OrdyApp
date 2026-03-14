import { useState, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Store, Menu, CreditCard, Save, Upload, QrCode, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QRCodeCanvas } from 'qrcode.react';
import { saveBusiness } from '../utils/api';

export default function ManagementDashboard() {
  const { businessInfo, setBusinessInfo } = useApp();
  const [formData, setFormData] = useState({
    name: businessInfo?.name || '',
    description: businessInfo?.description || '',
    logo: businessInfo?.logo || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const businessId = businessInfo?.id || `business_${Date.now()}`;
      
      const businessData = {
        businessId,
        name: formData.name,
        description: formData.description,
        logo: formData.logo,
      };

      // Save to backend
      await saveBusiness(businessData);

      // Update local state
      const newBusinessInfo = {
        id: businessId,
        name: formData.name,
        description: formData.description,
        logo: formData.logo,
      };
      setBusinessInfo(newBusinessInfo);
      
      alert('Business information saved successfully!');
    } catch (error) {
      console.error('Error saving business:', error);
      alert('Failed to save business information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const qrRef = useRef<HTMLCanvasElement>(null);

  const downloadQRCode = () => {
    if (!businessInfo?.id) {
      alert('Please save your business information first');
      return;
    }

    const canvas = qrRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${businessInfo.name.replace(/\s+/g, '_')}_QR_Code.png`;
    link.href = url;
    link.click();
  };

  const orderUrl = businessInfo?.id 
    ? `${window.location.origin}/order/${businessInfo.id}`
    : window.location.origin;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl text-gray-900">Management Dashboard</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Business Setup */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl text-gray-900">Business Information</h2>
            </div>

            <div className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">Business Logo</label>
                <div className="flex items-center gap-4">
                  {formData.logo && (
                    <img
                      src={formData.logo}
                      alt="Logo preview"
                      className="w-20 h-20 rounded-lg object-cover border"
                    />
                  )}
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">Upload Logo</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">Business Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your business name"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your business"
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                disabled={saving}
              >
                {saving ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.928l3-2.647z"></path>
                  </svg>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Business Info
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              to="/menu"
              className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Menu className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg mb-2 text-gray-900">Manage Menu</h3>
              <p className="text-gray-600">
                Add, edit, and organize your menu items and categories
              </p>
            </Link>

            <Link
              to="/payment"
              className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg mb-2 text-gray-900">Payment Methods</h3>
              <p className="text-gray-600">
                Configure bank transfers, e-wallets, and cash payment options
              </p>
            </Link>
          </div>

          {/* QR Code */}
          {businessInfo && (
            <div className="bg-white rounded-xl shadow-sm p-8 mt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl text-gray-900">Customer Order QR Code</h2>
              </div>

              <div className="space-y-6">
                <p className="text-gray-600">
                  Bagikan QR code ini kepada pelanggan Anda. Mereka dapat memindai untuk langsung mengakses halaman pemesanan bisnis Anda.
                </p>

                <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-lg">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <QRCodeCanvas
                      ref={qrRef}
                      value={orderUrl}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Link Pemesanan:</p>
                    <p className="text-xs text-gray-500 font-mono bg-white px-3 py-2 rounded border break-all">
                      {orderUrl}
                    </p>
                  </div>
                </div>

                <button
                  onClick={downloadQRCode}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}