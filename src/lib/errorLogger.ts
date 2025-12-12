import { supabase } from '@/integrations/supabase/client';

interface ErrorLogData {
  error_message: string;
  error_stack?: string;
  component_name?: string;
  url?: string;
  severity?: 'error' | 'warn' | 'info';
  metadata?: Record<string, any>;
}

const isProduction = import.meta.env.PROD;

export async function logError(data: ErrorLogData): Promise<void> {
  // In development, log to console
  if (!isProduction) {
    console.error('[Error Logger]', data);
    return;
  }

  try {
    // In production, send to backend
    const { error } = await supabase.functions.invoke('log-error', {
      body: {
        ...data,
        url: window.location.href,
      },
    });

    if (error) {
      // Fallback to console if logging fails
      console.error('[Error Logger - Failed to send]', data, error);
    }
  } catch (err) {
    // Fallback to console
    console.error('[Error Logger - Exception]', data, err);
  }
}

export function createErrorLogger(componentName: string) {
  return {
    error: (error: Error | string, metadata?: Record<string, any>) => {
      const errorMessage = typeof error === 'string' ? error : error.message;
      const errorStack = typeof error === 'string' ? undefined : error.stack;
      
      logError({
        error_message: errorMessage,
        error_stack: errorStack,
        component_name: componentName,
        severity: 'error',
        metadata,
      });
    },
    warn: (message: string, metadata?: Record<string, any>) => {
      logError({
        error_message: message,
        component_name: componentName,
        severity: 'warn',
        metadata,
      });
    },
    info: (message: string, metadata?: Record<string, any>) => {
      logError({
        error_message: message,
        component_name: componentName,
        severity: 'info',
        metadata,
      });
    },
  };
}

// Global error handler
if (isProduction) {
  window.addEventListener('error', (event) => {
    logError({
      error_message: event.message,
      error_stack: event.error?.stack,
      component_name: 'Global',
      severity: 'error',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logError({
      error_message: event.reason?.message || 'Unhandled Promise Rejection',
      error_stack: event.reason?.stack,
      component_name: 'Global',
      severity: 'error',
      metadata: {
        reason: String(event.reason),
      },
    });
  });
}
