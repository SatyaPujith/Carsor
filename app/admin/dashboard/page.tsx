'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users, Wrench, Plus, Edit, Trash2, Eye, EyeOff, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface User {
  _id: string;
  name: string;
  email: string;
  userType: string;
  phone?: string;
  vehicleModel?: string;
  vehicleRegistration?: string;
  companyName?: string;
  serviceLocation?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [serviceProviders, setServiceProviders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    serviceLocation: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/admin');
    } else if (session?.user && (session.user as any).userType !== 'admin') {
      router.push('/dashboard');
    } else if (session?.user) {
      fetchData();
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [usersRes, providersRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/service-providers')
      ]);
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
      
      if (providersRes.ok) {
        const providersData = await providersRes.json();
        setServiceProviders(providersData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingProvider(true);

    try {
      const response = await fetch('/api/admin/service-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProvider, userType: 'service_provider' }),
      });

      if (response.ok) {
        setNewProvider({ name: '', email: '', password: '', phone: '', companyName: '', serviceLocation: '' });
        fetchData();
        alert('Service provider added successfully');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add service provider');
      }
    } catch (error) {
      alert('Network error occurred');
    } finally {
      setIsAddingProvider(false);
    }
  };

  const handleUpdatePassword = async (userId: string, newPassword: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        alert('Password updated successfully');
      } else {
        alert('Failed to update password');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  const handleDeleteUser = async (userId: string, userType: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
        alert('User deleted successfully');
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user as any)?.userType !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent truncate">
                  AutoDoc AI Admin
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">System Administration</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 text-xs hidden sm:inline-flex">
                Administrator
              </Badge>
              <span className="text-xs sm:text-sm text-gray-600 font-medium hidden md:inline truncate max-w-24 sm:max-w-none">
                Welcome, {session.user?.name}
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })} className="border-red-200 text-red-600 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-3">
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">System Administration</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage users, service providers, and system settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <Users className="w-6 h-6 sm:w-8 sm:h-8" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{users.length}</p>
                  <p className="text-xs sm:text-sm text-blue-100">Vehicle Owners</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <Wrench className="w-6 h-6 sm:w-8 sm:h-8" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{serviceProviders.length}</p>
                  <p className="text-xs sm:text-sm text-green-100">Service Providers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{users.length + serviceProviders.length}</p>
                  <p className="text-xs sm:text-sm text-purple-100">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Vehicle Owners</TabsTrigger>
            <TabsTrigger value="providers">Service Providers</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Owners Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg bg-gray-50 space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm sm:text-base break-words">{user.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 break-all">{user.email}</p>
                        <p className="text-xs sm:text-sm text-gray-500 break-words">
                          Vehicle: {user.vehicleModel} • {user.vehicleRegistration}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reset Password</DialogTitle>
                              <DialogDescription>
                                Enter a new password for {user.name}
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.target as HTMLFormElement);
                              const newPassword = formData.get('password') as string;
                              handleUpdatePassword(user._id, newPassword);
                            }}>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="password">New Password</Label>
                                  <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    minLength={8}
                                  />
                                </div>
                                <Button type="submit" className="w-full">
                                  Update Password
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteUser(user._id, 'vehicle_owner')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Service Providers Management</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Service Provider
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Service Provider</DialogTitle>
                      <DialogDescription>
                        Create a new service provider account
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddProvider} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            required
                            value={newProvider.name}
                            onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            required
                            value={newProvider.phone}
                            onChange={(e) => setNewProvider({ ...newProvider, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={newProvider.email}
                          onChange={(e) => setNewProvider({ ...newProvider, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            minLength={8}
                            value={newProvider.password}
                            onChange={(e) => setNewProvider({ ...newProvider, password: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          required
                          value={newProvider.companyName}
                          onChange={(e) => setNewProvider({ ...newProvider, companyName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="serviceLocation">Service Location</Label>
                        <Input
                          id="serviceLocation"
                          required
                          placeholder="City, State"
                          value={newProvider.serviceLocation}
                          onChange={(e) => setNewProvider({ ...newProvider, serviceLocation: e.target.value })}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isAddingProvider}>
                        {isAddingProvider ? 'Adding...' : 'Add Service Provider'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceProviders.map((provider) => (
                    <div key={provider._id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-medium">{provider.name}</h4>
                        <p className="text-sm text-gray-600">{provider.email}</p>
                        <p className="text-sm text-gray-500">
                          {provider.companyName} • {provider.serviceLocation}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reset Password</DialogTitle>
                              <DialogDescription>
                                Enter a new password for {provider.name}
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.target as HTMLFormElement);
                              const newPassword = formData.get('password') as string;
                              handleUpdatePassword(provider._id, newPassword);
                            }}>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="password">New Password</Label>
                                  <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    minLength={8}
                                  />
                                </div>
                                <Button type="submit" className="w-full">
                                  Update Password
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteUser(provider._id, 'service_provider')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h4 className="font-medium text-blue-900 mb-2">Database Status</h4>
                    <p className="text-sm text-blue-700">Connected to MongoDB</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h4 className="font-medium text-green-900 mb-2">Authentication</h4>
                    <p className="text-sm text-green-700">NextAuth.js configured and running</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-purple-50">
                    <h4 className="font-medium text-purple-900 mb-2">AI Services</h4>
                    <p className="text-sm text-purple-700">Voice processing and AI analysis active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}