'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IssueForm from '@/components/dashboard/vehicle-owner/issue-form';
import IssueHistory from '@/components/dashboard/vehicle-owner/issue-history';
import AnalyticsDashboard from '@/components/dashboard/service-provider/analytics-dashboard';
import EditProfile from '@/components/dashboard/vehicle-owner/edit-profile';
import FloatingAIAssistant from '@/components/floating-ai-assistant';
import { Car, User, LogOut, Settings } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // State to preserve issue form data when switching tabs
  const [issueFormData, setIssueFormData] = useState({
    issueText: '',
    aiAnalysis: null,
    uploadedImage: null,
    imagePreview: null
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user) {
      fetchUserProfile();
    }
  }, [session, status, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleProfileSave = (updatedProfile: any) => {
    setUserProfile(updatedProfile);
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isVehicleOwner = (session.user as any)?.userType === 'vehicle_owner';
  const isAdmin = (session.user as any)?.userType === 'admin';

  // Redirect admin to admin dashboard
  if (isAdmin) {
    router.push('/admin/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Car className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AutoDoc AI</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Professional AI Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 font-medium text-xs sm:text-sm">
                {isVehicleOwner ? 'Vehicle Owner' : 'Service Provider'}
              </Badge>
              <span className="text-xs sm:text-sm text-slate-600 font-medium hidden sm:inline">
                Welcome, {session.user?.name}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-slate-300 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm px-2 sm:px-3">
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AutoDoc AI</h1>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
        {isVehicleOwner ? (
          /* Vehicle Owner Dashboard */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Vehicle Dashboard</h2>
              {userProfile && (
                <div className="text-right hidden sm:block">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium text-slate-700">Vehicle: {userProfile.vehicleModel}</p>
                    <p className="text-sm text-slate-600">Registration: {userProfile.vehicleRegistration}</p>
                  </div>
                </div>
              )}
            </div>

            <Tabs defaultValue="report" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-slate-200">
                <TabsTrigger value="report">Report Issue</TabsTrigger>
                <TabsTrigger value="history">Issue History</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="report">
                <IssueForm 
                  vehicleModel={userProfile?.vehicleModel || 'Unknown'} 
                  preservedData={issueFormData}
                  onDataChange={setIssueFormData}
                  onSubmit={(issue) => {
                    console.log('Issue submitted:', issue);
                    // Clear form data after successful submission
                    setIssueFormData({
                      issueText: '',
                      aiAnalysis: null,
                      uploadedImage: null,
                      imagePreview: null
                    });
                  }}
                />
              </TabsContent>

              <TabsContent value="history">
                <IssueHistory />
              </TabsContent>


              <TabsContent value="profile">
                {isEditingProfile ? (
                  <EditProfile 
                    userProfile={userProfile}
                    onSave={handleProfileSave}
                    onCancel={() => setIsEditingProfile(false)}
                  />
                ) : (
                  <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xl font-bold">Profile Information</span>
                          <p className="text-sm text-blue-100 font-normal">Manage your account</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {userProfile ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 border border-slate-200">
                              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Full Name
                              </label>
                              <p className="text-lg text-slate-800 mt-1">{userProfile.name}</p>
                            </div>
                            <div className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 border border-slate-200">
                              <label className="text-sm font-semibold text-slate-700">Email Address</label>
                              <p className="text-lg text-slate-800 mt-1">{userProfile.email}</p>
                            </div>
                            <div className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 border border-slate-200">
                              <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                              <p className="text-lg text-slate-800 mt-1">{userProfile.phone}</p>
                            </div>
                            <div className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 border border-slate-200">
                              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Car className="w-4 h-4" />
                                Vehicle Model
                              </label>
                              <p className="text-lg text-slate-800 mt-1">{userProfile.vehicleModel}</p>
                            </div>
                            <div className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 border border-slate-200">
                              <label className="text-sm font-semibold text-slate-700">Manufacturing Year</label>
                              <p className="text-lg text-slate-800 mt-1">{userProfile.vehicleYear}</p>
                            </div>
                            <div className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-4 border border-slate-200">
                              <label className="text-sm font-semibold text-slate-700">Registration Number</label>
                              <p className="text-lg text-slate-800 mt-1">{userProfile.vehicleRegistration}</p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => setIsEditingProfile(true)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-600">Loading profile...</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          /* Service Provider Dashboard */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Analytics Dashboard</h2>
              <Badge variant="default" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium">Professional Analytics</Badge>
            </div>
            <AnalyticsDashboard />
          </div>
        )}
      </div>
      
      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
    </div>
  );
}