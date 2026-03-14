import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Plus, Trash2, Edit, CreditCard, Wallet, Banknote, Upload, X } from 'lucide-react';
import { useApp, PaymentMethod } from '../context/AppContext';
import { savePaymentMethods } from '../utils/api';

export default function PaymentSetup() {
  const { paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, businessInfo } = useApp();
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: 'bank' as 'bank' | 'ewallet' | 'cash',
    name: '',
    accountNumber: '',
    accountName: '',
    qrCodeImage: '',
  });

  // Save payment methods to backend whenever they change
  useEffect(() => {
    if (businessInfo?.id && paymentMethods.length > 0) {
      savePaymentMethodsToBackend();
    }
  }, [paymentMethods, businessInfo?.id]);

  const savePaymentMethodsToBackend = async () => {
    if (!businessInfo?.id) return;
    
    try {
      await savePaymentMethods(businessInfo.id, paymentMethods);
    } catch (error) {
      console.error('Error saving payment methods to backend:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'bank',
      name: '',
      accountNumber: '',
      accountName: '',
      qrCodeImage: '',
    });
    setIsAddingMethod(false);
    setEditingMethod(null);
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Please fill in the payment method name');
      return;
    }

    if (formData.type !== 'cash' && !formData.accountNumber) {
      alert('Please fill in the account number');
      return;
    }

    if (!businessInfo?.id) {
      alert('Please set up your business first');
      return;
    }

    try {
      setSaving(true);

      const method: PaymentMethod = {
        id: editingMethod?.id || `payment_${Date.now()}`,
        type: formData.type,
        name: formData.name,
        accountNumber: formData.accountNumber || undefined,
        accountName: formData.accountName || undefined,
        qrCodeImage: formData.qrCodeImage || undefined,
      };

      if (editingMethod) {
        updatePaymentMethod(editingMethod.id, method);
      } else {
        addPaymentMethod(method);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving payment method:', error);
      alert('Failed to save payment method. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      type: method.type,
      name: method.name,
      accountNumber: method.accountNumber || '',
      accountName: method.accountName || '',
      qrCodeImage: method.qrCodeImage || '',
    });
    setIsAddingMethod(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, qrCodeImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeQrImage = () => {
    setFormData({ ...formData, qrCodeImage: '' });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <CreditCard className="w-5 h-5" />;
      case 'ewallet':
        return <Wallet className="w-5 h-5" />;
      case 'cash':
        return <Banknote className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bank':
        return 'bg-blue-100 text-blue-700';
      case 'ewallet':
        return 'bg-purple-100 text-purple-700';
      case 'cash':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/management" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl text-gray-900">Payment Methods</h1>
            </div>
            <button
              onClick={() => setIsAddingMethod(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Payment Method
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Add/Edit Form */}
          {isAddingMethod && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg mb-4 text-gray-900">
                {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Payment Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as 'bank' | 'ewallet' | 'cash' })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="bank">Bank Transfer</option>
                    <option value="ewallet">E-Wallet</option>
                    <option value="cash">Cash at Cashier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Bank ABC, GoPay, Cash"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {formData.type !== 'cash' && (
                  <>
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">
                        Account Number / Phone *
                      </label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        placeholder="Enter account number or phone number"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-gray-700">Account Name</label>
                      <input
                        type="text"
                        value={formData.accountName}
                        onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                        placeholder="Enter account holder name"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-gray-700">QR Code Image</label>
                      
                      {formData.qrCodeImage ? (
                        <div className="space-y-2">
                          <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={formData.qrCodeImage}
                                alt="QR Code Preview"
                                className="w-20 h-20 object-contain rounded"
                              />
                              <span className="text-sm text-gray-600">QR Code uploaded</span>
                            </div>
                            <button
                              type="button"
                              onClick={removeQrImage}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="qrCodeUpload"
                          />
                          <label
                            htmlFor="qrCodeUpload"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            <Upload className="w-4 h-4" />
                            Upload QR Code
                          </label>
                          <p className="text-xs text-gray-500 mt-1">Upload an image of your payment QR code</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Payment Methods List */}
          {paymentMethods.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-500">
                No payment methods configured yet. Click "Add Method" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(method.type)}`}>
                      {getIcon(method.type)}
                    </div>
                    <div>
                      <h3 className="text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{method.type}</p>
                      {method.accountNumber && (
                        <p className="text-sm text-gray-600">
                          {method.accountNumber}
                          {method.accountName && ` - ${method.accountName}`}
                        </p>
                      )}
                      {method.qrCodeImage && (
                        <p className="text-sm text-gray-600">
                          <a href={method.qrCodeImage} target="_blank" rel="noopener noreferrer">
                            View QR Code
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(method)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this payment method?')) {
                          deletePaymentMethod(method.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}