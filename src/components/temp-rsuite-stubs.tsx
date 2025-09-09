// Temporary stubs for RSuite components to maintain compatibility while migrating
import React, { createContext } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { toast } from 'sonner';

// Form context for RSuite-style form value binding
const FormContext = createContext<{
  formValue?: any;
  onChange?: (value: any) => void;
} | null>(null);

// Hook to access form context
const useFormContext = () => {
  return React.useContext(FormContext);
};

// Form component stubs
export const Form = ({ children, onSubmit, formValue, onChange, ...props }: any) => (
  <FormContext.Provider value={{ formValue, onChange }}>
    <form onSubmit={onSubmit ? (e) => { e.preventDefault(); onSubmit(); } : undefined} {...props}>
      {children}
    </form>
  </FormContext.Provider>
);

Form.Group = ({ children, className = "", controlId: _controlId, ...props }: any) => (
  <div className={`mb-4 space-y-2 ${className}`} {...props}>{children}</div>
);

Form.ControlLabel = ({ children, ...props }: any) => (
  <Label {...props}>{children}</Label>
);

export const FormControl = ({ 
  accepter, 
  name,
  placeholder,
  value,
  onChange,
  fluid: _fluid, // Remove from DOM output
  handleTitle: _handleTitle, // Remove this prop - not valid for inputs
  min,
  max,
  step,
  format,
  ...props 
}: any) => {
  // In RSuite, Form.Control gets values from the parent Form's formValue based on name
  // We need to access the form context to get the actual value
  const formContext = useFormContext();
  const actualValue = formContext?.formValue?.[name] || value;
  const actualOnChange = (newValue: any) => {
    if (formContext?.onChange) {
      formContext.onChange({ ...formContext.formValue, [name]: newValue });
    }
    if (onChange) {
      onChange(newValue);
    }
  };

  // Filter out non-HTML input attributes
  const validInputProps = { ...props };
  delete validInputProps.handleTitle;
  delete validInputProps.fluid;
  
  if (accepter === DatePicker) {
    return (
      <DatePicker
        name={name}
        value={actualValue}
        onChange={actualOnChange}
        format={format}
        placeholder={placeholder}
        style={{ width: _fluid ? '100%' : undefined }}
        {...validInputProps}
      />
    );
  }
  if (accepter === InputNumber) {
    return (
      <Input 
        type="number"
        name={name}
        placeholder={placeholder}
        value={actualValue || ''}
        onChange={(e) => actualOnChange(Number(e.target.value) || 0)}
        style={{ width: _fluid ? '100%' : undefined }}
        min={min}
        max={max}
        step={step}
        {...validInputProps}
      />
    );
  }
  if (accepter === Toggle) {
    return (
      <Toggle 
        checked={actualValue}
        onCheckedChange={actualOnChange}
        {...validInputProps}
      />
    );
  }
  if (accepter === Switch) {
    return (
      <Switch 
        checked={actualValue}
        onCheckedChange={actualOnChange}
        {...validInputProps}
      />
    );
  }
  return (
    <Input 
      name={name}
      placeholder={placeholder}
      value={actualValue || ''}
      onChange={(e) => actualOnChange(e.target.value)}
      style={{ width: _fluid ? '100%' : undefined }}
      {...validInputProps}
    />
  );
};

// Attach FormControl to Form
Form.Control = FormControl;

Form.HelpText = ({ children, className = "", ...props }: any) => (
  <div className={`text-sm text-muted-foreground mt-1 ${className}`} {...props}>
    {children}
  </div>
);

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



export const Toggle = ({ checked, onChange, onCheckedChange, ...props }: any) => {
  const handleChange = onCheckedChange || onChange;
  
  return (
    <label style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      cursor: 'pointer',
      gap: '0.5rem'
    }}>
      <input 
        type="checkbox"
        checked={checked}
        onChange={(e) => handleChange && handleChange(e.target.checked)}
        style={{
          width: '1.25rem',
          height: '1.25rem',
          accentColor: '#1675e0'
        }}
        {...props}
      />
      <span className="text-sm">
        {checked ? 'Aktiviert' : 'Deaktiviert'}
      </span>
    </label>
  );
};

export const Divider = ({ ...props }: any) => (
  <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} {...props} />
);

export const IconButton = ({ children, onClick, ...props }: any) => (
  <button 
    onClick={onClick}
    style={{ 
      background: 'none', 
      border: '1px solid #e5e7eb', 
      borderRadius: '0.375rem',
      padding: '0.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
    {...props}
  >
    {children}
  </button>
);

export const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6"></polyline>
    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
  </svg>
);