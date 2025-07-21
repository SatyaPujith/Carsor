'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, AlertTriangle, Wrench, Car, Users, Clock } from 'lucide-react';

interface Issue {
  _id: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved';
  vehicleModel: string;
  createdAt: string;
  resolvedAt?: string;
  userId: string;
}

interface AnalyticsData {
  overview: {
    totalIssues: number;
    resolvedIssues: number;
    activeIssues: number;
    criticalIssues: number;
    totalUsers: number;
    avgResolutionTime: number;
  };
  issuesByModel: Array<{
    model: string;
    issues: number;
    resolved: number;
    resolutionRate: number;
  }>;
  issuesByCategory: Array<{
    category: string;
    count: number;
    color: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    issues: number;
    resolved: number;
  }>;
  commonFlaws: Array<{
    issue: string;
    frequency: number;
    severity: string;
    affectedModels: string[];
  }>;
  severityDistribution: Array<{
    severity: string;
    count: number;
    percentage: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/issues');
      if (response.ok) {
        const issuesData = await response.json();
        setIssues(issuesData);
        processAnalyticsData(issuesData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (issuesData: Issue[]) => {
    if (!issuesData || issuesData.length === 0) {
      setData({
        overview: {
          totalIssues: 0,
          resolvedIssues: 0,
          activeIssues: 0,
          criticalIssues: 0,
          totalUsers: 0,
          avgResolutionTime: 0,
        },
        issuesByModel: [],
        issuesByCategory: [],
        monthlyTrends: [],
        commonFlaws: [],
        severityDistribution: [],
      });
      return;
    }

    // Overview calculations
    const totalIssues = issuesData.length;
    const resolvedIssues = issuesData.filter(issue => issue.status === 'resolved').length;
    const activeIssues = totalIssues - resolvedIssues;
    const criticalIssues = issuesData.filter(issue => issue.severity === 'high').length;
    const uniqueUsers = new Set(issuesData.map(issue => issue.userId)).size;

    // Calculate average resolution time
    const resolvedWithTime = issuesData.filter(issue => issue.status === 'resolved' && issue.resolvedAt);
    const avgResolutionTime = resolvedWithTime.length > 0 
      ? resolvedWithTime.reduce((acc, issue) => {
          const created = new Date(issue.createdAt);
          const resolved = new Date(issue.resolvedAt!);
          return acc + (resolved.getTime() - created.getTime());
        }, 0) / resolvedWithTime.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Issues by model
    const modelCounts = issuesData.reduce((acc, issue) => {
      const model = issue.vehicleModel || 'Unknown';
      if (!acc[model]) {
        acc[model] = { total: 0, resolved: 0 };
      }
      acc[model].total++;
      if (issue.status === 'resolved') {
        acc[model].resolved++;
      }
      return acc;
    }, {} as Record<string, { total: number; resolved: number }>);

    const issuesByModel = Object.entries(modelCounts).map(([model, counts]) => ({
      model,
      issues: counts.total,
      resolved: counts.resolved,
      resolutionRate: counts.total > 0 ? Math.round((counts.resolved / counts.total) * 100) : 0,
    })).sort((a, b) => b.issues - a.issues);

    // Issues by category
    const categoryCounts = issuesData.reduce((acc, issue) => {
      const category = issue.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#3b82f6', '#ef4444', '#f97316', '#eab308', '#22c55e', '#8b5cf6', '#6b7280'];
    const issuesByCategory = Object.entries(categoryCounts).map(([category, count], index) => ({
      category,
      count,
      color: colors[index % colors.length],
    })).sort((a, b) => b.count - a.count);

    // Monthly trends (last 6 months)
    const monthlyData = {} as Record<string, { issues: number; resolved: number }>;
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyData[monthKey] = { issues: 0, resolved: 0 };
    }

    issuesData.forEach(issue => {
      const issueDate = new Date(issue.createdAt);
      const monthKey = issueDate.toLocaleDateString('en-US', { month: 'short' });
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].issues++;
        if (issue.status === 'resolved') {
          monthlyData[monthKey].resolved++;
        }
      }
    });

    const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      issues: data.issues,
      resolved: data.resolved,
    }));

    // Common flaws analysis
    const flawPatterns = {} as Record<string, {
      frequency: number;
      severity: Record<string, number>;
      models: Set<string>;
      descriptions: string[];
    }>;

    issuesData.forEach(issue => {
      const description = issue.description.toLowerCase();
      const category = issue.category || 'Other';
      
      // Group similar issues by category and keywords
      const key = category;
      if (!flawPatterns[key]) {
        flawPatterns[key] = {
          frequency: 0,
          severity: { low: 0, medium: 0, high: 0 },
          models: new Set(),
          descriptions: [],
        };
      }
      
      flawPatterns[key].frequency++;
      flawPatterns[key].severity[issue.severity]++;
      flawPatterns[key].models.add(issue.vehicleModel);
      flawPatterns[key].descriptions.push(issue.description);
    });

    const commonFlaws = Object.entries(flawPatterns)
      .map(([pattern, data]) => {
        const mostCommonSeverity = Object.entries(data.severity)
          .sort(([,a], [,b]) => b - a)[0][0];
        
        return {
          issue: `${pattern} related issues`,
          frequency: data.frequency,
          severity: mostCommonSeverity,
          affectedModels: Array.from(data.models),
        };
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // Severity distribution
    const severityCounts = issuesData.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severityDistribution = Object.entries(severityCounts).map(([severity, count]) => ({
      severity: severity.charAt(0).toUpperCase() + severity.slice(1),
      count,
      percentage: Math.round((count / totalIssues) * 100),
    }));

    setData({
      overview: {
        totalIssues,
        resolvedIssues,
        activeIssues,
        criticalIssues,
        totalUsers: uniqueUsers,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      },
      issuesByModel,
      issuesByCategory,
      monthlyTrends,
      commonFlaws,
      severityDistribution,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  if (data.overview.totalIssues === 0) {
    return (
      <div className="text-center py-12">
        <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h3>
        <p className="text-gray-500">No vehicle issues have been reported yet. Analytics will appear once users start submitting issues.</p>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#ef4444', '#f97316', '#eab308', '#22c55e', '#8b5cf6', '#6b7280'];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Car className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-lg sm:text-xl font-bold">{data.overview.totalIssues}</p>
                <p className="text-xs text-gray-600">Total Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-lg sm:text-xl font-bold">{data.overview.resolvedIssues}</p>
                <p className="text-xs text-gray-600">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              <div>
                <p className="text-lg sm:text-xl font-bold">{data.overview.activeIssues}</p>
                <p className="text-xs text-gray-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <p className="text-lg sm:text-xl font-bold">{data.overview.criticalIssues}</p>
                <p className="text-xs text-gray-600">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              <div>
                <p className="text-lg sm:text-xl font-bold">{data.overview.totalUsers}</p>
                <p className="text-xs text-gray-600">Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-600" />
              <div>
                <p className="text-lg sm:text-xl font-bold">{data.overview.avgResolutionTime}d</p>
                <p className="text-xs text-gray-600">Avg Resolution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Vehicle Models</TabsTrigger>
          <TabsTrigger value="categories">Issue Categories</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="flaws">Manufacturing Insights</TabsTrigger>
          <TabsTrigger value="severity">Severity Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>Issues by Tata Vehicle Model</CardTitle>
              <p className="text-sm text-gray-600">Analysis of reported issues across different Tata models</p>
            </CardHeader>
            <CardContent>
              {data.issuesByModel.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.issuesByModel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="model" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="issues" fill="#3b82f6" name="Total Issues" />
                    <Bar dataKey="resolved" fill="#22c55e" name="Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No model data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Issues by Category</CardTitle>
              <p className="text-sm text-gray-600">Distribution of issues across different vehicle systems</p>
            </CardHeader>
            <CardContent>
              {data.issuesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.issuesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, count }: any) => `${category}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.issuesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No category data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Issue Trends</CardTitle>
              <p className="text-sm text-gray-600">Tracking issue reporting and resolution patterns over time</p>
            </CardHeader>
            <CardContent>
              {data.monthlyTrends.some(month => month.issues > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="issues" stroke="#ef4444" strokeWidth={2} name="Issues Reported" />
                    <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} name="Issues Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No trend data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flaws">
          <Card>
            <CardHeader>
              <CardTitle>Manufacturing Insights & Common Flaws</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">Critical insights for future vehicle design and manufacturing improvements</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-4">
                {data.commonFlaws.length > 0 ? (
                  data.commonFlaws.map((flaw, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg bg-gray-50 space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm sm:text-base break-words">{flaw.issue}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 break-words">
                          Reported {flaw.frequency} times across {flaw.affectedModels.join(', ')}
                        </p>
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs text-gray-500">Models: </span>
                            {flaw.affectedModels.map((model, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {model}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <Badge 
                          variant={flaw.severity === 'high' ? 'destructive' : flaw.severity === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {flaw.severity} priority
                        </Badge>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          Manufacturing Impact
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No manufacturing insights available yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="severity">
          <Card>
            <CardHeader>
              <CardTitle>Issue Severity Distribution</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">Understanding the criticality of reported issues</p>
            </CardHeader>
            <CardContent>
              {data.severityDistribution.length > 0 ? (
                <div className="space-y-2 sm:space-y-4">
                  {data.severityDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 sm:p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${
                          item.severity === 'High' ? 'bg-red-500' : 
                          item.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <span className="font-medium text-sm sm:text-base">{item.severity} Severity</span>
                      </div>
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-bold">{item.count}</span>
                        <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No severity data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}