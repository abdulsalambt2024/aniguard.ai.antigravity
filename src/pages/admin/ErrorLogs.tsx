import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Bug, Info, Search, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

interface ErrorLog {
  id: string;
  error_message: string;
  error_stack: string | null;
  component_name: string | null;
  url: string | null;
  user_id: string | null;
  severity: string | null;
  metadata: any;
  created_at: string;
}

export default function ErrorLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['error-logs', severityFilter],
    queryFn: async () => {
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ErrorLog[];
    },
  });

  const filteredLogs = logs?.filter(log =>
    log.error_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.component_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSeverityIcon = (severity: string | null) => {
    switch (severity) {
      case 'error':
        return <Bug className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string | null) => {
    switch (severity) {
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500">Warning</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Error Logs</h1>
          <p className="text-muted-foreground">Monitor and debug application errors</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search errors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
                <SelectItem value="warning">Warnings</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredLogs?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No error logs found
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredLogs?.map((log) => (
                  <Card key={log.id} className="border">
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getSeverityIcon(log.severity)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{log.error_message}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {getSeverityBadge(log.severity)}
                              {log.component_name && (
                                <Badge variant="outline">{log.component_name}</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                              </span>
                            </div>
                          </div>
                        </div>
                        {expandedId === log.id ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      {expandedId === log.id && (
                        <div className="mt-4 space-y-3 text-sm">
                          {log.url && (
                            <div>
                              <span className="font-medium">URL:</span>{' '}
                              <code className="bg-muted px-2 py-1 rounded text-xs">{log.url}</code>
                            </div>
                          )}
                          {log.error_stack && (
                            <div>
                              <span className="font-medium">Stack Trace:</span>
                              <pre className="bg-muted p-3 rounded mt-1 overflow-x-auto text-xs">
                                {log.error_stack}
                              </pre>
                            </div>
                          )}
                          {log.metadata && (
                            <div>
                              <span className="font-medium">Metadata:</span>
                              <pre className="bg-muted p-3 rounded mt-1 overflow-x-auto text-xs">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.user_id && (
                            <div>
                              <span className="font-medium">User ID:</span>{' '}
                              <code className="bg-muted px-2 py-1 rounded text-xs">{log.user_id}</code>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
