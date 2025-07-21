'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tataModels } from '@/lib/tata-models';
import { Car, User } from 'lucide-react';

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const userType = 'vehicle_owner'; // Only vehicle owners can sign up
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleRegistration: '',
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userType }),
      });

      if (response.ok) {
        router.push('/auth/signin?message=Account created successfully');
      } else {
        const error = await response.json();
        alert(error.message || 'Signup failed');
      }
    } catch (error) {
      alert('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <Car className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Join AutoDoc AI</CardTitle>
          <CardDescription className="text-gray-600">Create your vehicle owner account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-700">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Vehicle Owner Registration</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">Service providers are managed by administrators</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters required</p>
            </div>

            <div>
              <Label htmlFor="vehicleModel">Tata Vehicle Model</Label>
              <Select value={formData.vehicleModel} onValueChange={(value) => setFormData({ ...formData, vehicleModel: value })}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500">
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
              <div>
                <Label htmlFor="vehicleYear">Year</Label>
                <Input
                  id="vehicleYear"
                  type="number"
                  min="2010"
                  max="2024"
                  required
                  value={formData.vehicleYear}
                  onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="vehicleRegistration">Registration</Label>
                <Input
                  id="vehicleRegistration"
                  type="text"
                  required
                  placeholder="e.g., MH01AB1234"
                  value={formData.vehicleRegistration}
                  onChange={(e) => setFormData({ ...formData, vehicleRegistration: e.target.value })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">Already have an account? </span>
            <Button variant="link" onClick={() => router.push('/auth/signin')} className="p-0">
              Sign In
            </Button>
          </div>
          
          <div className="mt-4 pt-4 border-t text-center">
            <Button variant="link" onClick={() => router.push('/auth/admin')} className="text-xs text-gray-500 p-0">
              Administrator Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}