// Temporary stubs for RSuite components to maintain compatibility while migrating
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button as ShadcnButton } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

// Re-export Button from shadcn
export const Button = ShadcnButton;

// Panel component stub
export const Panel = ({ 
  header, 
  children, 
  bordered: _bordered, 
  collapsible: _collapsible, 
  bodyFill: _bodyFill, 
  expanded: _expanded, 
  ...props 
}: any) => (
  <Card {...props}>
    {header && (
      <CardHeader>
        <CardTitle>{header}</CardTitle>
      </CardHeader>
    )}
    <CardContent>{children}</CardContent>
  </Card>
);

// Form component stubs
export const Form = ({ children, onSubmit, ...props }: any) => (
  <form onSubmit={onSubmit ? (e) => { e.preventDefault(); onSubmit(); } : undefined} {...props}>
    {children}
  </form>
);

Form.Group = ({ children, ...props }: any) => (
  <div style={{ marginBottom: '1rem' }} {...props}>{children}</div>
);

Form.ControlLabel = ({ children, ...props }: any) => (
  <Label {...props}>{children}</Label>
);

Form.Control = ({ 
  accepter, 
  name,
  placeholder,
  value,
  onChange,
  ...props 
}: any) => {
  if (accepter === DatePicker) {
    return (
      <Input 
        type="month"
        name={name}
        placeholder={placeholder}
        value={value ? value.toISOString().slice(0, 7) : ''}
        onChange={(e) => onChange && onChange(new Date(e.target.value))}
        {...props}
      />
    );
  }
  if (accepter === InputNumber) {
    return (
      <Input 
        type="number"
        name={name}
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        {...props}
      />
    );
  }
  return (
    <Input 
      name={name}
      placeholder={placeholder}
      value={value || ''}
      onChange={(e) => onChange && onChange(e.target.value)}
      {...props}
    />
  );
};

Form.HelpText = ({ children, ...props }: any) => (
  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }} {...props}>
    {children}
  </div>
);

// Simple component stubs
export const ButtonToolbar = ({ children, ...props }: any) => (
  <div style={{ display: 'flex', gap: '0.5rem' }} {...props}>{children}</div>
);

export const DatePicker = () => null; // Used as accepter identifier
export const InputNumber = () => null; // Used as accepter identifier

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
export const Radio = ({ children, value, ...props }: any) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <input type="radio" value={value} {...props} />
    {children}
  </label>
);

export const RadioGroup = ({ children, value, onChange, ...props }: any) => (
  <div {...props}>
    {React.Children.map(children, (child) => 
      React.cloneElement(child, { 
        checked: child.props.value === value,
        onChange: () => onChange && onChange(child.props.value)
      })
    )}
  </div>
);

export const RadioTile = Radio;
export const RadioTileGroup = RadioGroup;

export const Slider = ({ value, onChange, min, max, step, ...props }: any) => (
  <input 
    type="range"
    value={value}
    onChange={(e) => onChange && onChange(Number(e.target.value))}
    min={min}
    max={max}
    step={step}
    style={{ width: '100%' }}
    {...props}
  />
);

export const Table = ({ children, ...props }: any) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }} {...props}>
    {children}
  </table>
);

// Add Column, HeaderCell, Cell as properties of Table
export const Column = () => null; // Not used in actual render, just for RSuite compatibility
export const HeaderCell = ({ children, ...props }: any) => (
  <th style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }} {...props}>
    {children}
  </th>
);
export const Cell = ({ children, ...props }: any) => (
  <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }} {...props}>
    {children}
  </td>
);

// Assign static properties for RSuite compatibility
(Table as any).Column = Column;
(Table as any).HeaderCell = HeaderCell;
(Table as any).Cell = Cell;

export const Toggle = ({ checked, onChange, ...props }: any) => (
  <input 
    type="checkbox"
    checked={checked}
    onChange={(e) => onChange && onChange(e.target.checked)}
    {...props}
  />
);

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