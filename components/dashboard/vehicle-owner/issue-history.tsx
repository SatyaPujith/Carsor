'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Issue {
  _id: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  hasImage?: boolean;
}

export default function IssueHistory() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await fetch('/api/issues');
      if (response.ok) {
        const data = await response.json();
        setIssues(data);
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (issueId: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved', resolvedAt: new Date() }),
      });

      if (response.ok) {
        fetchIssues(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to update issue:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issue History</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issue History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {issues.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No issues reported yet</p>
            ) : (
              issues.map((issue) => (
                <Card key={issue._id} className={`${issue.status === 'resolved' ? 'bg-green-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getSeverityIcon(issue.severity)}
                          <Badge variant={issue.status === 'resolved' ? 'default' : 'secondary'}>
                            {issue.category}
                          </Badge>
                          <Badge variant={issue.severity === 'high' ? 'destructive' : 'outline'}>
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{issue.description}</p>
                        <p className="text-xs text-gray-500">
                          Reported: {new Date(issue.createdAt).toLocaleDateString()}
                          {issue.resolvedAt && (
                            <span> • Resolved: {new Date(issue.resolvedAt).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant={issue.status === 'resolved' ? 'default' : 'destructive'}>
                          {issue.status}
                        </Badge>
                        {issue.status === 'open' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsResolved(issue._id)}
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}