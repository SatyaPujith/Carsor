'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tataModels } from '@/lib/tata-models';
import { Save, X, User, Car, Phone, Mail } from 'lucide-react';

interface EditProfileProps {
  userProfile: any;
  onSave: (updatedProfile: any) => void;
  onCancel: () => void;
}

export default function EditProfile({ userProfile, onSave, onCancel }: EditProfileProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleRegistration: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        vehicleModel: userProfile.vehicleModel || '',
        vehicleYear: userProfile.vehicleYear?.toString() || '',
        vehicleRegistration: userProfile.vehicleRegistration || ''
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vehicleYear: parseInt(formData.vehicleYear)
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        onSave(updatedProfile);
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      alert('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getModelName = (modelId: string) => {
    const model = tataModels.find(m => m.id === modelId);
    return model ? `${model.name} (${model.category})` : modelId;
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold">Edit Profile</span>
            <p className="text-sm text-blue-100 font-normal">Update your information</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-gray-700 font-medium">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-2 border-blue-200 focus:border-blue-400 rounded-lg bg-white/80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2 text-gray-700 font-medium">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border-2 border-blue-200 focus:border-blue-400 rounded-lg bg-white/80"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 font-medium">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={userProfile?.email || ''}
              disabled
              className="border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-500"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div className="border-t pt-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Car className="w-5 h-5" />
              Vehicle Information
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleModel" className="text-gray-700 font-medium">
                  Tata Vehicle Model
                </Label>
                <Select 
                  value={formData.vehicleModel} 
                  onValueChange={(value) => setFormData({ ...formData, vehicleModel: value })}
                >
                  <SelectTrigger className="border-2 border-blue-200 focus:border-blue-400 rounded-lg bg-white/80">
                    <SelectValue placeholder="Select your Tata model" />
                  </SelectTrigger>
                  <SelectContent>
                    {tataModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} ({model.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleYear" className="text-gray-700 font-medium">
                    Manufacturing Year
                  </Label>
                  <Input
                    id="vehicleYear"
                    type="number"
                    min="2010"
                    max="2024"
                    required
                    value={formData.vehicleYear}
                    onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                    className="border-2 border-blue-200 focus:border-blue-400 rounded-lg bg-white/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleRegistration" className="text-gray-700 font-medium">
                    Registration Number
                  </Label>
                  <Input
                    id="vehicleRegistration"
                    type="text"
                    required
                    placeholder="e.g., MH01AB1234"
                    value={formData.vehicleRegistration}
                    onChange={(e) => setFormData({ ...formData, vehicleRegistration: e.target.value.toUpperCase() })}
                    className="border-2 border-blue-200 focus:border-blue-400 rounded-lg bg-white/80"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg py-3 shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </div>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1 border-2 border-gray-300 hover:bg-gray-50 rounded-lg py-3"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}