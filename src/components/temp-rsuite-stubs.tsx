// Temporary stubs for RSuite components to maintain compatibility while migrating
import React from 'react';
import { Input } from './ui/input';
import { toast } from 'sonner';

// Simple component stubs
export const ButtonToolbar = ({ children, ...props }: any) => (
  <div style={{ display: 'flex', gap: '0.5rem' }} {...props}>{children}</div>
);

export const DatePicker = ({ value, onChange, format, placeholder, ...props }: any) => {
  // Convert Date to YYYY-MM or YYYY-MM-DD format for input
  const formatDate = (date: Date | string | null): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    if (format === 'yyyy-MM') {
      return d.toISOString().substring(0, 7); // YYYY-MM
    }
    return d.toISOString().substring(0, 10); // YYYY-MM-DD (default)
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (!inputValue) {
      onChange && onChange(null);
      return;
    }
    
    // Create date from input value
    const date = new Date(inputValue + (format === 'yyyy-MM' ? '-01' : ''));
    if (!isNaN(date.getTime())) {
      onChange && onChange(date);
    }
  };

  return (
    <Input
      type={format === 'yyyy-MM' ? 'month' : 'date'}
      value={formatDate(value)}
      onChange={handleChange}
      placeholder={placeholder}
      {...props}
    />
  );
};
export const InputNumber = ({ value, onChange, min, max, step, placeholder, fluid: _fluid, ...props }: any) => (
  <Input
    type="number"
    value={value || ''}
    onChange={(e) => onChange && onChange(e.target.value ? Number(e.target.value) : undefined)}
    min={min}
    max={max}
    step={step}
    placeholder={placeholder}
    style={{ width: _fluid ? '100%' : undefined }}
    {...props}
  />
);

export const Message = ({ type, children, ...props }: any) => (
  <div style={{ 
    padding: '0.75rem', 
    borderRadius: '0.375rem',
    backgroundColor: type === 'success' ? '#dcfce7' : type === 'info' ? '#dbeafe' : '#f3f4f6',
    color: type === 'success' ? '#166534' : type === 'info' ? '#1e40af' : '#374151'
  }} {...props}>
    {children}
  </div>
);

export const useToaster = () => ({
  push: (message: any, _options?: any) => {
    if (React.isValidElement(message)) {
      const props: any = message.props;
      if (props.type === 'success') {
        toast.success(props.children);
      } else if (props.type === 'info') {
        toast.info(props.children);
      } else {
        toast(props.children);
      }
    } else {
      toast(message);
    }
  }
});

// Stubs for EntnahmeSimulationsAusgabe components
// Components have been migrated to shadcn/ui equivalents