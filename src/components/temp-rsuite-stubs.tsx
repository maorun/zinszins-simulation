// Temporary stubs for RSuite components to maintain compatibility while migrating
import React, { useState, createContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button as ShadcnButton } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Slider as ShadcnSlider } from './ui/slider';
import { Switch } from './ui/switch';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { RadioTileGroup as ShadcnRadioTileGroup } from './ui/radio-tile';

// Form context for RSuite-style form value binding
const FormContext = createContext<{
  formValue?: any;
  onChange?: (value: any) => void;
} | null>(null);

// Hook to access form context
const useFormContext = () => {
  return React.useContext(FormContext);
};

// Re-export Button from shadcn with appearance prop compatibility
export const Button = ({ appearance, startIcon, ...props }: any) => {
  // Map RSuite appearance to shadcn variants
  let variant = 'default';
  if (appearance === 'primary') variant = 'default';
  if (appearance === 'ghost') variant = 'ghost';
  if (appearance === 'subtle') variant = 'secondary';
  
  return (
    <ShadcnButton variant={variant as any} {...props}>
      {startIcon && <span style={{ marginRight: '0.5rem' }}>{startIcon}</span>}
      {props.children}
    </ShadcnButton>
  );
};

// Enhanced Panel component with proper collapsible functionality
export const Panel = ({ 
  header, 
  children, 
  bordered: _bordered, 
  collapsible = false, 
  bodyFill: _bodyFill, 
  expanded = false,
  defaultExpanded = false, // Now defaults to false
  className = "",
  ...props 
}: any) => {
  const [isOpen, setIsOpen] = useState(expanded !== undefined ? expanded : defaultExpanded);
  
  if (!collapsible) {
    // Non-collapsible panel - just render as a regular Card
    return (
      <Card className={`mb-6 ${className}`} {...props}>
        {header && (
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{header}</CardTitle>
          </CardHeader>
        )}
        <CardContent className="pt-0">{children}</CardContent>
      </Card>
    );
  }

  // Collapsible panel using Radix UI Collapsible
  return (
    <Card className={`mb-6 ${className}`} {...props}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {header && (
          <CardHeader className="pb-4">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                <CardTitle className="text-left text-lg">{header}</CardTitle>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </CollapsibleTrigger>
          </CardHeader>
        )}
        <CollapsibleContent>
          <CardContent className="pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
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
  if (accepter === Slider) {
    return (
      <div className="space-y-2">
        <ShadcnSlider 
          value={[actualValue || 0]}
          onValueChange={(values: number[]) => actualOnChange(values[0])}
          min={min}
          max={max}
          step={step}
          className="mt-2"
          {...validInputProps}
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>{min}</span>
          <span className="font-medium text-gray-900">{actualValue || 0}%</span>
          <span>{max}</span>
        </div>
      </div>
    );
  }
  if (accepter === ShadcnRadioTileGroup || accepter?.displayName === 'RadioTileGroup') {
    return (
      <ShadcnRadioTileGroup 
        value={actualValue}
        onValueChange={actualOnChange}
        {...validInputProps}
      >
        {props.children}
      </ShadcnRadioTileGroup>
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
export const Radio = ({ children, value, checked, onChange, ...props }: any) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
    <input 
      type="radio" 
      value={value} 
      checked={checked}
      onChange={onChange}
      {...props} 
    />
    {children}
  </label>
);

export const RadioGroup = ({ children, value, onChange, inline, ...props }: any) => (
  <div style={{ display: inline ? 'flex' : 'block', gap: inline ? '1rem' : '0.5rem' }} {...props}>
    {React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;
      const childProps = child.props as any;
      return React.cloneElement(child as any, { 
        checked: childProps.value === value,
        onChange: () => onChange && onChange(childProps.value)
      });
    })}
  </div>
);

export const RadioTile = ({ children, value, checked, onChange, label, ...props }: any) => (
  <label 
    style={{ 
      display: 'block',
      padding: '1rem',
      border: '2px solid',
      borderColor: checked ? '#1675e0' : '#e5e7eb',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      backgroundColor: checked ? '#f0f8ff' : 'white',
      transition: 'all 0.2s ease'
    }}
    {...props}
  >
    <input 
      type="radio" 
      value={value}
      checked={checked}
      onChange={onChange}
      style={{ display: 'none' }}
    />
    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{label}</div>
    <div style={{ fontSize: '0.875rem', color: '#666' }}>{children}</div>
  </label>
);

export const RadioTileGroup = ({ children, value, onChange, onValueChange, ...props }: any) => {
  const handleChange = onValueChange || onChange;
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }} {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const childProps = child.props as any;
        return React.cloneElement(child as any, { 
          checked: childProps.value === value,
          onChange: () => handleChange && handleChange(childProps.value)
        });
      })}
    </div>
  );
};

export const Slider = ({ value, onChange, min, max, step, handleTitle: _handleTitle, ...props }: any) => (
  <div className="space-y-2">
    <ShadcnSlider 
      value={[value || 0]}
      onValueChange={(values: number[]) => onChange && onChange(values[0])}
      min={min}
      max={max}
      step={step}
      className="mt-2"
      {...props}
    />
    <div className="flex justify-between text-sm text-gray-500">
      <span>{min}</span>
      <span className="font-medium text-gray-900">{value || 0}{typeof value === 'number' && value < 1 ? '' : ''}</span>
      <span>{max}</span>
    </div>
  </div>
);

// Define Table sub-components that actually render content
const Column = ({ children, width: _width, flexGrow: _flexGrow }: any) => {
  // Column is a container that renders its children
  return <>{children}</>;
};

const HeaderCell = ({ children, ...props }: any) => (
  <th style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }} {...props}>
    {children}
  </th>
);

const Cell = ({ children, dataKey: _dataKey, ...props }: any) => {
  // If it's a function, call it with rowData context
  if (typeof children === 'function') {
    return (
      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }} {...props}>
        {/* Function cells will be handled by the parent Table */}
        {children}
      </td>
    );
  }
  
  return (
    <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }} {...props}>
      {children}
    </td>
  );
};

// Create Table component that processes Column children
const TableComponent = ({ children, data, bordered: _bordered, rowHeight: _rowHeight, ...props }: any) => {
  // Extract columns from children
  const columns = React.Children.toArray(children).filter((child: any) => 
    child?.type === Column
  );

  if (!data || data.length === 0) {
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }} {...props}>
        <thead>
          <tr>
            {columns.map((column: any, index) => {
              const headerCell = React.Children.toArray(column.props.children).find((child: any) => 
                React.isValidElement(child) && child?.type === HeaderCell
              );
              return (
                <HeaderCell key={index}>
                  {React.isValidElement(headerCell) ? (headerCell.props as any).children : ''}
                </HeaderCell>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
              Keine Daten verfügbar
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }} {...props}>
      <thead>
        <tr>
          {columns.map((column: any, index) => {
            const headerCell = React.Children.toArray(column.props.children).find((child: any) => 
              React.isValidElement(child) && child?.type === HeaderCell
            );
            return (
              <HeaderCell key={index}>
                {React.isValidElement(headerCell) ? (headerCell.props as any).children : ''}
              </HeaderCell>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {data.map((rowData: any, rowIndex: number) => (
          <tr key={rowIndex}>
            {columns.map((column: any, colIndex) => {
              const cell = React.Children.toArray(column.props.children).find((child: any) => 
                React.isValidElement(child) && child?.type === Cell
              );
              
              if (!React.isValidElement(cell)) return <td key={colIndex}></td>;
              
              const cellProps = cell.props as any;
              
              // Handle function children
              if (typeof cellProps.children === 'function') {
                return (
                  <Cell key={colIndex}>
                    {cellProps.children(rowData)}
                  </Cell>
                );
              }
              
              // Handle dataKey
              if (cellProps.dataKey) {
                return (
                  <Cell key={colIndex}>
                    {rowData[cellProps.dataKey]}
                  </Cell>
                );
              }
              
              // Handle direct children
              return (
                <Cell key={colIndex}>
                  {cellProps.children}
                </Cell>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Attach sub-components to Table
TableComponent.Column = Column;
TableComponent.HeaderCell = HeaderCell;
TableComponent.Cell = Cell;

export const Table = TableComponent;

// Also export individual components for direct imports
export { Column, HeaderCell, Cell };

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